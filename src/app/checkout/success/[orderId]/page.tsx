import type { Metadata } from "next";
import Link from "next/link";
import { FiCheckCircle, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import PaymentQrCard from "@/components/checkout/PaymentQrCard";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order Confirmed | Cake House" };

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ method?: string; amount?: string }>;
};

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { method, amount } = await searchParams;

  let order: { order_number: string; total: number; advance_amount: number; delivery_address: string } | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number, total, advance_amount, delivery_address")
      .eq("id", orderId)
      .maybeSingle();
    order = data;
  }

  const whatsappHref = buildWhatsAppLink(
    `Hi ${business.name}! I just placed order ${order?.order_number ?? orderId} on the website.`
  );

  return (
    <>
      <PageHero eyebrow="Thank You" title="Order Confirmed!" />
      <section className="bg-cream-light py-16 md:py-20">
        <div className="container-px max-w-xl mx-auto text-center space-y-6">
          <FiCheckCircle className="mx-auto text-6xl text-green-600" />
          {order ? (
            <>
              <p className="text-ink/70">
                Your order <span className="font-bold text-brown">#{order.order_number}</span> has been
                placed. We&apos;ll start preparing it soon!
              </p>
              <div className="bg-cream rounded-2xl p-5 text-left text-sm space-y-1">
                <p>
                  <span className="text-ink/50">Total:</span>{" "}
                  <span className="font-semibold">₹{order.total}</span>
                </p>
                <p>
                  <span className="text-ink/50">Delivery to:</span> {order.delivery_address}
                </p>
              </div>
            </>
          ) : (
            <p className="text-ink/70">Your order has been placed. We&apos;ll start preparing it soon!</p>
          )}

          {method === "qr" && (
            <div className="text-left">
              <p className="text-sm font-semibold text-brown mb-3 text-center">
                Please complete your advance payment now
              </p>
              <PaymentQrCard amount={Number(amount) || 200} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
            >
              <FaWhatsapp /> Message Us
            </a>
            <a
              href={`tel:+91${business.phones[0]}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brown text-brown font-semibold px-6 py-3 hover:bg-brown hover:text-cream-light transition-colors"
            >
              <FiPhone /> Call Us
            </a>
          </div>

          <div className="pt-2">
            <Button href="/menu" variant="ghost">
              Continue Shopping
            </Button>
          </div>
          <p className="text-xs text-ink/40">
            <Link href="/account/orders" className="hover:text-rose">
              Track this order in your account →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
