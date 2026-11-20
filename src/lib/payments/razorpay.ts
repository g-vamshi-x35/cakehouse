import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient(): Razorpay {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(
    crypto.createHmac("sha256", secret).update(`${params.orderId}|${params.paymentId}`).digest("hex")
  );
  const given = Buffer.from(params.signature);
  // Constant-time compare so the signature can't be guessed byte by byte.
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
