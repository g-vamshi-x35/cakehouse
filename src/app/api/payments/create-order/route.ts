import { NextResponse } from "next/server";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { isRazorpayConfigured, getRazorpayClient } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  if (!isRazorpayConfigured() || !isAdminClientConfigured()) {
    return NextResponse.json({ error: "Online payments aren't configured yet." }, { status: 500 });
  }

  const { orderId } = await request.json().catch(() => ({}));
  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  // The order's UUID is the capability here (same as the confirmation page).
  // The amount always comes from the stored order — never from the request
  // body, which the browser could set to ₹1.
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, advance_amount, payment_status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.payment_status !== "unpaid") {
    return NextResponse.json({ error: "This order has already been paid." }, { status: 409 });
  }

  const amount = Number(order.advance_amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Nothing to pay for this order." }, { status: 400 });
  }

  try {
    const razorpay = getRazorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: order.order_number,
      notes: { order_id: orderId },
    });

    const { error: insertError } = await supabase.from("payments").insert({
      order_id: orderId,
      amount,
      method: "razorpay",
      razorpay_order_id: rpOrder.id,
      status: "created",
    });
    if (insertError) throw insertError;

    return NextResponse.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create-order failed:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }
}
