import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { sendEmail, paymentConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, isAdvance } =
    await request.json();

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .update({ razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature, status: "paid" })
    .eq("razorpay_order_id", razorpayOrderId)
    .select("amount")
    .maybeSingle();

  const { data: order } = await supabase
    .from("orders")
    .update({
      payment_status: isAdvance ? "advance_paid" : "paid_full",
      order_status: "confirmed",
    })
    .eq("id", orderId)
    .select("order_number, customer_id, customer_email")
    .maybeSingle();

  if (order?.customer_id) {
    await supabase.from("notifications").insert({
      user_id: order.customer_id,
      title: `Payment received for #${order.order_number}`,
      body: `We've received your payment of ₹${payment?.amount ?? ""}. Thank you!`,
      type: "payment",
    });
  }

  if (order?.customer_email && payment?.amount) {
    const { subject, text } = paymentConfirmationEmail({
      orderNumber: order.order_number,
      amount: payment.amount,
    });
    await sendEmail({ to: order.customer_email, subject, text });
  }

  return NextResponse.json({ ok: true });
}
