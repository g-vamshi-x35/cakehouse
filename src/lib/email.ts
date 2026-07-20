import "server-only";
import { Resend } from "resend";
import { business } from "@/data/business";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  if (!isEmailConfigured() || !to) return false;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Cake House <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
    return true;
  } catch (err) {
    console.error("sendEmail failed:", err);
    return false;
  }
}

export function orderConfirmationEmail(params: {
  orderNumber: string;
  total: number;
  advanceAmount: number;
}) {
  return {
    subject: `Order Confirmed — #${params.orderNumber}`,
    text: `Thanks for your order at ${business.name}!\n\nOrder #${params.orderNumber}\nTotal: ₹${params.total}\nAdvance due: ₹${params.advanceAmount}\n\nWe'll get started on it right away. We'll message you with updates as your order moves along.\n\n— ${business.name}`,
  };
}

export function paymentConfirmationEmail(params: { orderNumber: string; amount: number }) {
  return {
    subject: `Payment Received — #${params.orderNumber}`,
    text: `We've received your payment of ₹${params.amount} for order #${params.orderNumber}. Thank you!\n\n— ${business.name}`,
  };
}

export function birthdayEmail(name: string) {
  return {
    subject: `🎂 Happy Birthday from ${business.name}!`,
    text: `Hi ${name},\n\nWishing you a very happy birthday from all of us at ${business.name}! 🎉\n\nHow about celebrating with one of our cakes? Reply to this email or message us on WhatsApp and we'll take care of the rest.\n\nWarmly,\n${business.name}`,
  };
}
