"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MIN_ADVANCE_AMOUNT } from "@/lib/orders/constants";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";

export type OrderItemInput = {
  productId: string;
  name: string;
  weightLabel?: string;
  flavour?: string;
  customMessage?: string;
  qty: number;
  unitPrice: number;
};

export type PlaceOrderInput = {
  items: OrderItemInput[];
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  deliveryInstructions?: string;
  eventDate?: string;
  eventTime?: string;
  paymentMethod: "razorpay_full" | "razorpay_advance" | "qr_advance";
  advanceAmount?: number;
  couponCode?: string;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string; total: number; advanceAmount: number }
  | { ok: false; error: string };

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (input.items.length === 0) return { ok: false, error: "Your cart is empty." };
  if (!input.customerName.trim() || !input.phone.trim() || !input.address.trim()) {
    return { ok: false, error: "Please fill in your name, phone number and delivery address." };
  }

  const subtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

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

  const total = Math.max(0, subtotal - discount);
  const advanceAmount =
    input.paymentMethod === "razorpay_full"
      ? total
      : Math.max(MIN_ADVANCE_AMOUNT, input.advanceAmount ?? MIN_ADVANCE_AMOUNT);

  const paymentMethod = input.paymentMethod === "qr_advance" ? "qr_manual" : "razorpay";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      customer_name: input.customerName.trim(),
      customer_phone: input.phone.trim(),
      customer_email: input.email?.trim() || null,
      delivery_address: input.address.trim(),
      delivery_instructions: input.deliveryInstructions?.trim() || null,
      event_date: input.eventDate || null,
      event_time: input.eventTime || null,
      subtotal,
      discount,
      coupon_id: couponId,
      total,
      advance_amount: advanceAmount,
      payment_method: paymentMethod,
      payment_status: "unpaid",
      order_status: "pending",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message || "Could not create your order. Please try again." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      weight_label: item.weightLabel ?? null,
      flavour: item.flavour ?? null,
      custom_message: item.customMessage ?? null,
      quantity: item.qty,
      unit_price: item.unitPrice,
      line_total: item.unitPrice * item.qty,
    }))
  );

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

  if (input.email) {
    const { subject, text } = orderConfirmationEmail({
      orderNumber: order.order_number,
      total,
      advanceAmount,
    });
    await sendEmail({ to: input.email, subject, text });
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
