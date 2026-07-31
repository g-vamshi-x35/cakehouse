"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { QUICK_ORDER_ADVANCE_AMOUNT } from "@/lib/orders/constants";
import { geocodeAddress, reverseGeocode, distanceFromShopKm } from "@/lib/delivery/geocode";
import { calculateDeliveryCharge, FLAT_RATE_ACTIVE, FLAT_RATE } from "@/lib/delivery/pricing";

export type QuickOrderInput = {
  productId: string;
  productName: string;
  weightLabel?: string;
  flavour?: string;
  customMessage?: string;
  qty: number;
  unitPrice: number;
  customerName: string;
  phone: string;
  address: string;
  deliveryInstructions?: string;
  eventDate?: string;
  eventTime?: string;
  paymentMethod: "razorpay" | "qr_manual";
  couponCode?: string;
  deliveryCharge?: number;
  deliveryDistanceKm?: number;
  deliveryLat?: number;
  deliveryLng?: number;
};

export type DeliveryChargeResult =
  | { ok: true; charge: number; distanceKm: number | null; lat: number | null; lng: number | null }
  | { ok: false };

// A bakery serving this area realistically never delivers 100km+ — treat
// anything past this as a bad geocode match rather than a real address,
// even though the search is already boxed to the local region (defense in
// depth, not just relying on the viewbox).
const MAX_PLAUSIBLE_DELIVERY_KM = 100;

// While the flat rate is active, the charge doesn't depend on distance at
// all — so a geocoding failure shouldn't block it from being charged.
// (This is what caused the flat rate to still show ₹0 for addresses the
// free geocoder couldn't parse: the old code returned ok:false whenever
// geocoding failed, regardless of whether the charge even needed the
// distance.) Falls back to the old distance-required behavior once the
// flat rate is switched off.
function flatRateFallback(): DeliveryChargeResult {
  if (!FLAT_RATE_ACTIVE) return { ok: false };
  return { ok: true, charge: FLAT_RATE, distanceKm: null, lat: null, lng: null };
}

// Never blocks checkout — a failed lookup just means the UI falls back to
// a flat default charge and asks the customer to confirm the exact fee on
// WhatsApp, since this uses the free (best-effort) OpenStreetMap geocoder.
export async function calculateDeliveryChargeAction(address: string): Promise<DeliveryChargeResult> {
  if (!address.trim()) return { ok: false };

  const location = await geocodeAddress(address.trim());
  if (!location) return flatRateFallback();

  const distanceKm = distanceFromShopKm(location.lat, location.lng);
  if (distanceKm > MAX_PLAUSIBLE_DELIVERY_KM) return flatRateFallback();

  const charge = calculateDeliveryCharge(distanceKm);

  return { ok: true, charge, distanceKm, lat: location.lat, lng: location.lng };
}

export type DeliveryChargeFromCoordsResult =
  | { ok: true; charge: number; distanceKm: number; lat: number; lng: number; address: string | null }
  | { ok: false };

// Used by "Use My Current Location" — the device's own GPS coordinates are
// far more reliable than trying to parse a typed address through a free
// text geocoder, since there's no ambiguity to resolve at all. Reverse
// geocodes only to prefill a readable address for the order/kitchen; the
// charge itself comes straight from the coordinates.
export async function calculateDeliveryChargeFromCoordsAction(
  lat: number,
  lng: number
): Promise<DeliveryChargeFromCoordsResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { ok: false };

  const distanceKm = distanceFromShopKm(lat, lng);
  if (distanceKm > MAX_PLAUSIBLE_DELIVERY_KM) return { ok: false };

  const charge = calculateDeliveryCharge(distanceKm);
  const address = await reverseGeocode(lat, lng);

  return { ok: true, charge, distanceKm, lat, lng, address };
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string; total: number; advanceAmount: number }
  | { ok: false; error: string };

export async function placeQuickOrderAction(input: QuickOrderInput): Promise<PlaceOrderResult> {
  if (!input.customerName.trim() || !input.phone.trim() || !input.address.trim()) {
    return { ok: false, error: "Please fill in your name, phone number and delivery address." };
  }

  const subtotal = input.unitPrice * input.qty;

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        "Online ordering isn't connected yet — please use the WhatsApp order button instead, or check back soon.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let discount = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("id, discount_type, discount_value, min_order_amount, active, expires_at, max_uses, used_count")
      .eq("code", input.couponCode.trim().toUpperCase())
      .maybeSingle();

    if (coupon && coupon.active && subtotal >= coupon.min_order_amount) {
      const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
      const usesLeft = !coupon.max_uses || coupon.used_count < coupon.max_uses;
      if (notExpired && usesLeft) {
        discount =
          coupon.discount_type === "percent"
            ? Math.round((subtotal * coupon.discount_value) / 100)
            : coupon.discount_value;
        couponId = coupon.id;
      }
    }
  }

  const deliveryCharge = Math.max(0, input.deliveryCharge ?? 0);
  const total = Math.max(0, subtotal - discount) + deliveryCharge;
  // Can't take a bigger advance than the order is actually worth (matters for
  // low-priced snack items under the fixed advance amount).
  const advanceAmount = Math.min(QUICK_ORDER_ADVANCE_AMOUNT, total);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      customer_name: input.customerName.trim(),
      customer_phone: input.phone.trim(),
      customer_email: null,
      delivery_address: input.address.trim(),
      delivery_instructions: input.deliveryInstructions?.trim() || null,
      event_date: input.eventDate || null,
      event_time: input.eventTime || null,
      subtotal,
      discount,
      coupon_id: couponId,
      total,
      advance_amount: advanceAmount,
      payment_method: input.paymentMethod,
      payment_status: "unpaid",
      order_status: "pending",
      delivery_charge: deliveryCharge,
      delivery_distance_km: input.deliveryDistanceKm ?? null,
      delivery_lat: input.deliveryLat ?? null,
      delivery_lng: input.deliveryLng ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message || "Could not create your order. Please try again." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: input.productId,
    product_name: input.productName,
    weight_label: input.weightLabel ?? null,
    flavour: input.flavour ?? null,
    custom_message: input.customMessage ?? null,
    quantity: input.qty,
    unit_price: input.unitPrice,
    line_total: input.unitPrice * input.qty,
  });

  if (itemsError) {
    return { ok: false, error: itemsError.message };
  }

  if (couponId) {
    await supabase.rpc("increment_coupon_usage", { coupon_id: couponId });
  }

  if (user) {
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: `Order #${order.order_number} placed`,
      body: `Your order for ₹${total} has been received. We'll keep you posted as it moves along.`,
      type: "order",
    });
  }

  return { ok: true, orderId: order.id, orderNumber: order.order_number, total, advanceAmount };
}

export type CouponCheckResult =
  | { ok: true; discount: number; code: string }
  | { ok: false; error: string };

export async function validateCouponAction(code: string, subtotal: number): Promise<CouponCheckResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Coupons aren't available right now." };
  if (!code.trim()) return { ok: false, error: "Enter a coupon code." };

  const supabase = await createClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("code, discount_type, discount_value, min_order_amount, active, expires_at, max_uses, used_count")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!coupon || !coupon.active) return { ok: false, error: "Invalid coupon code." };
  if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
    return { ok: false, error: "This coupon has expired." };
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.min_order_amount) {
    return { ok: false, error: `This coupon needs a minimum order of ₹${coupon.min_order_amount}.` };
  }

  const discount =
    coupon.discount_type === "percent"
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : coupon.discount_value;

  return { ok: true, discount, code: coupon.code };
}
