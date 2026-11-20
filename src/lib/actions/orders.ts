"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { getProductById } from "@/lib/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { QUICK_ORDER_ADVANCE_AMOUNT } from "@/lib/orders/constants";
import { geocodeAddress, reverseGeocode, distanceFromShopKm } from "@/lib/delivery/geocode";
import { calculateDeliveryCharge, FLAT_RATE_ACTIVE, FLAT_RATE } from "@/lib/delivery/pricing";
import { matchVillageCharge } from "@/lib/delivery/villages";

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

  // A known local village always wins — it's a fixed price the owner set
  // directly, and skips the free geocoder (and its history of mismatches)
  // entirely for the addresses we deliver to most.
  const villageMatch = matchVillageCharge(address);
  if (villageMatch) {
    return { ok: true, charge: villageMatch.charge, distanceKm: null, lat: null, lng: null };
  }

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

  const address = await reverseGeocode(lat, lng);
  const villageMatch = address ? matchVillageCharge(address) : null;
  const charge = villageMatch ? villageMatch.charge : calculateDeliveryCharge(distanceKm);

  return { ok: true, charge, distanceKm, lat, lng, address };
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string; total: number; advanceAmount: number }
  | { ok: false; error: string };

// The delivery charge shown in the browser is only a preview: recompute it
// here from the submitted address/coordinates so it can't be edited down.
// Mirrors calculateDeliveryChargeAction / ...FromCoordsAction, but skips the
// slow geocoder whenever the answer doesn't depend on it.
async function resolveDeliveryCharge(input: QuickOrderInput): Promise<number> {
  const village = matchVillageCharge(input.address);
  if (village) return village.charge;
  if (FLAT_RATE_ACTIVE) return FLAT_RATE;

  if (Number.isFinite(input.deliveryLat) && Number.isFinite(input.deliveryLng)) {
    const km = distanceFromShopKm(input.deliveryLat!, input.deliveryLng!);
    if (km <= MAX_PLAUSIBLE_DELIVERY_KM) return calculateDeliveryCharge(km);
  }
  const result = await calculateDeliveryChargeAction(input.address);
  if (result.ok) return result.charge;
  // Address couldn't be priced: the UI already tells the customer the fee
  // will be confirmed on WhatsApp. Never accept less than the client's own
  // preview, and never a negative value.
  return Math.max(0, Math.round(input.deliveryCharge ?? 0));
}

const MAX_QTY = 50;

export async function placeQuickOrderAction(input: QuickOrderInput): Promise<PlaceOrderResult> {
  if (!input.customerName.trim() || !input.phone.trim() || !input.address.trim()) {
    return { ok: false, error: "Please fill in your name, phone number and delivery address." };
  }

  if (!isSupabaseConfigured() || !isAdminClientConfigured()) {
    return {
      ok: false,
      error:
        "Online ordering isn't connected yet — please use the WhatsApp order button instead, or check back soon.",
    };
  }

  const qty = Math.floor(Number(input.qty));
  if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
    return { ok: false, error: `Quantity must be between 1 and ${MAX_QTY}.` };
  }

  // Price always comes from the database — never from the browser, where it
  // could be edited to anything.
  const product = await getProductById(input.productId);
  if (!product) return { ok: false, error: "This item is no longer available." };
  if (product.available === false) {
    return { ok: false, error: "This item is currently unavailable." };
  }

  let unitPrice: number;
  if (product.weightOptions?.length) {
    const option = product.weightOptions.find((w) => w.label === input.weightLabel);
    if (!option || option.price == null) {
      return { ok: false, error: "Please choose a valid size for this item." };
    }
    unitPrice = Number(option.price);
  } else {
    unitPrice = Number(product.price);
  }
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return { ok: false, error: "This item can't be ordered online right now." };
  }

  const subtotal = unitPrice * qty;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Orders are written with the service-role client: customers no longer
  // have direct insert access to orders/order_items (see migration 0019).
  const admin = createAdminClient();

  let discount = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("id, discount_type, discount_value, min_order_amount, active, expires_at, max_uses, used_count")
      .eq("code", input.couponCode.trim().toUpperCase())
      .maybeSingle();

    if (coupon && coupon.active && subtotal >= coupon.min_order_amount) {
      const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
      const usesLeft = !coupon.max_uses || coupon.used_count < coupon.max_uses;
      if (notExpired && usesLeft) {
        discount = Math.min(
          subtotal,
          coupon.discount_type === "percent"
            ? Math.round((subtotal * coupon.discount_value) / 100)
            : Number(coupon.discount_value)
        );
        couponId = coupon.id;
      }
    }
  }

  const deliveryCharge = await resolveDeliveryCharge(input);
  const total = Math.max(0, subtotal - discount) + deliveryCharge;
  // Can't take a bigger advance than the order is actually worth (matters for
  // low-priced snack items under the fixed advance amount).
  const advanceAmount = Math.min(QUICK_ORDER_ADVANCE_AMOUNT, total);
  const isQr = input.paymentMethod === "qr_manual";

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      customer_name: input.customerName.trim(),
      customer_phone: input.phone.trim(),
      customer_email: user?.email ?? null,
      delivery_address: input.address.trim(),
      delivery_instructions: input.deliveryInstructions?.trim() || null,
      event_date: input.eventDate || null,
      event_time: input.eventTime || null,
      subtotal,
      discount,
      coupon_id: couponId,
      total,
      advance_amount: advanceAmount,
      payment_method: isQr ? "qr_manual" : "razorpay",
      // A QR/UPI order is paid outside the app, so it waits for staff to
      // confirm the money arrived ("Confirm Advance Received" on the order).
      payment_status: isQr ? "advance_pending" : "unpaid",
      order_status: "pending",
      delivery_charge: deliveryCharge,
      delivery_distance_km: input.deliveryDistanceKm ?? null,
      delivery_lat: input.deliveryLat ?? null,
      delivery_lng: input.deliveryLng ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Order insert failed:", orderError);
    return { ok: false, error: "Could not create your order. Please try again." };
  }

  const { error: itemsError } = await admin.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    product_name: product.name,
    weight_label: input.weightLabel ?? null,
    flavour: input.flavour ?? null,
    custom_message: input.customMessage?.trim() || null,
    quantity: qty,
    unit_price: unitPrice,
    line_total: subtotal,
  });

  if (itemsError) {
    console.error("Order items insert failed:", itemsError);
    // Don't leave a half-written order (no items) in the kitchen's queue.
    await admin.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Could not create your order. Please try again." };
  }

  if (couponId) {
    await admin.rpc("increment_coupon_usage", { coupon_id: couponId });
  }

  if (user) {
    await admin.from("notifications").insert({
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

  const discount = Math.min(
    subtotal,
    coupon.discount_type === "percent"
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : Number(coupon.discount_value)
  );

  return { ok: true, discount, code: coupon.code };
}
