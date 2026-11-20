"use server";

import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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

export async function placeQuickOrderAction(input: QuickOrderInput): Promise<PlaceOrderResult> {
  if (!input.customerName.trim() || !input.phone.trim() || !input.address.trim()) {
    return { ok: false, error: "Please fill in your name, phone number and delivery address." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        "Online ordering isn't connected yet — please use the WhatsApp order button instead, or check back soon.",
    };
  }

  // Curated availability (e.g. seasonal items switched off) lives in the
  // static catalog, so it's checked here; the price itself is looked up by
  // the database function below and never taken from the browser.
  const product = await getProductById(input.productId);
  if (!product) return { ok: false, error: "This item is no longer available." };
  if (product.available === false) {
    return { ok: false, error: "This item is currently unavailable." };
  }

  const deliveryCharge = await resolveDeliveryCharge(input);

  // place_quick_order (migration 0025) validates the price, coupon and
  // customer inside the database, so this works with the public key alone —
  // no service-role key needed for ordering.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_quick_order", {
    p_product_id: input.productId,
    p_weight_label: input.weightLabel ?? "",
    p_flavour: input.flavour ?? "",
    p_custom_message: input.customMessage ?? "",
    p_qty: Math.floor(Number(input.qty)),
    p_customer_name: input.customerName,
    p_phone: input.phone,
    p_address: input.address,
    p_instructions: input.deliveryInstructions ?? "",
    p_event_date: input.eventDate || null,
    p_event_time: input.eventTime || null,
    p_payment_method: input.paymentMethod === "qr_manual" ? "qr_manual" : "razorpay",
    p_coupon_code: input.couponCode ?? "",
    p_delivery_charge: deliveryCharge,
    p_distance_km: input.deliveryDistanceKm ?? null,
    p_lat: input.deliveryLat ?? null,
    p_lng: input.deliveryLng ?? null,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) {
    console.error("place_quick_order failed:", error);
    // Our own validation messages (raised by the function) are safe to show.
    const message = error?.message ?? "";
    const friendly = /^(Please|Quantity|This item)/.test(message) ? message : "Could not create your order. Please try again.";
    return { ok: false, error: friendly };
  }

  return {
    ok: true,
    orderId: row.order_id,
    orderNumber: row.order_number,
    total: Number(row.total),
    advanceAmount: Number(row.advance_amount),
  };
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
