import { NextResponse } from "next/server";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { isRazorpayConfigured, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { sendEmail, paymentConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  if (!isRazorpayConfigured() || !isAdminClientConfigured()) {
    return NextResponse.json({ error: "Online payments aren't configured yet." }, { status: 500 });
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request
    .json()
    .catch(() => ({}));

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({
    orderId: String(razorpayOrderId),
    paymentId: String(razorpayPaymentId),
    signature: String(razorpaySignature),
  });

  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // The signed Razorpay order must be the one created for THIS order —
  // otherwise a cheap payment for one order could confirm a different one.
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, status")
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("order_id", orderId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }
  if (payment.status === "paid") {
    return NextResponse.json({ ok: true }); // already verified (retry/double submit)
  }

  await supabase
    .from("payments")
    .update({ razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature, status: "paid" })
    .eq("id", payment.id);

  const { data: current } = await supabase
    .from("orders")
    .select("total")
    .eq("id", orderId)
    .maybeSingle();
  const paidInFull = current ? Number(payment.amount) >= Number(current.total) : false;

  const { data: order } = await supabase
    .from("orders")
    .update({
      payment_status: paidInFull ? "paid_full" : "advance_paid",
      order_status: "confirmed",
    })
    .eq("id", orderId)
    .select("order_number, customer_id, customer_email")
    .maybeSingle();

  if (order?.customer_id) {
    await supabase.from("notifications").insert({
      user_id: order.customer_id,
      title: `Payment received for #${order.order_number}`,
      body: `We've received your payment of ₹${payment.amount}. Thank you!`,
      type: "payment",
    });
  }

  if (order?.customer_email) {
    const { subject, text } = paymentConfirmationEmail({
      orderNumber: order.order_number,
      amount: payment.amount,
    });
    await sendEmail({ to: order.customer_email, subject, text });
  }

  return NextResponse.json({ ok: true });
}
