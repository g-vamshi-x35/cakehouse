import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRazorpayConfigured, getRazorpayClient } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Online payments aren't configured yet." }, { status: 500 });
  }

  const { orderId, amount } = await request.json();
  if (!orderId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid order or amount." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("id, order_number").eq("id", orderId).single();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  try {
    const razorpay = getRazorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: order.order_number,
      notes: { order_id: orderId },
    });

    await supabase.from("payments").insert({
      order_id: orderId,
      amount,
      method: "razorpay",
      razorpay_order_id: rpOrder.id,
      status: "created",
    });

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
