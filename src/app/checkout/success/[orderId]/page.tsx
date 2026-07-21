import type { Metadata } from "next";
import Link from "next/link";
import { FiPhone, FiPackage } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import PaymentQrCard from "@/components/checkout/PaymentQrCard";
import OrderCelebration from "@/components/checkout/OrderCelebration";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { PaymentStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Order Confirmed | Cake House" };

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ method?: string; amount?: string }>;
};

type OrderRow = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  advance_amount: number;
  delivery_address: string;
  event_date: string | null;
  payment_status: PaymentStatus;
};

type OrderItemRow = {
  product_name: string;
  weight_label: string | null;
  flavour: string | null;
  quantity: number;
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, { text: string; className: string }> = {
  unpaid: { text: "Unpaid", className: "bg-red-100 text-red-700" },
  advance_pending: { text: "Advance Pending", className: "bg-amber-100 text-amber-700" },
  advance_paid: { text: "Advance Paid", className: "bg-green-100 text-green-700" },
  paid_full: { text: "Paid in Full", className: "bg-green-100 text-green-700" },
  refunded: { text: "Refunded", className: "bg-gray-100 text-gray-600" },
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return value;
  }
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { method, amount } = await searchParams;

  let order: OrderRow | null = null;
  let orderItems: OrderItemRow[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ data: orderData }, { data: itemsData }] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "order_number, customer_name, customer_phone, total, advance_amount, delivery_address, event_date, payment_status"
        )
        .eq("id", orderId)
        .maybeSingle(),
      supabase
        .from("order_items")
        .select("product_name, weight_label, flavour, quantity")
        .eq("order_id", orderId),
    ]);
    order = orderData;
    orderItems = itemsData ?? [];
  }

  const whatsappHref = buildWhatsAppLink(
    `Hi ${business.name}! I just placed order ${order?.order_number ?? orderId} on the website.`
  );
  const deliveryDate = formatDate(order?.event_date ?? null);
  const statusInfo = order ? PAYMENT_STATUS_LABEL[order.payment_status] : null;

  return (
    <>
      <PageHero eyebrow="Thank You" title="Order Confirmed!" />
      <section className="bg-cream-light py-16 md:py-20">
        <div className="container-px max-w-xl mx-auto text-center space-y-6">
          <OrderCelebration />

          <div>
            <h2 className="font-heading text-2xl text-brown">🎉 Thank You!</h2>
            <p className="text-ink/70 mt-1">Your order has been placed successfully.</p>
          </div>

          {order ? (
            <div className="bg-cream rounded-2xl p-5 text-left text-sm space-y-2.5">
              <DetailRow label="Order ID" value={`#${order.order_number}`} />
              <DetailRow label="Customer Name" value={order.customer_name} />
              {orderItems.map((item, i) => (
                <DetailRow
                  key={i}
                  label={orderItems.length > 1 ? `Cake ${i + 1}` : "Cake Name"}
                  value={`${item.product_name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`}
                />
              ))}
              {orderItems.some((i) => i.weight_label) && (
                <DetailRow
                  label="Weight"
                  value={orderItems.map((i) => i.weight_label).filter(Boolean).join(", ")}
                />
              )}
              {orderItems.some((i) => i.flavour) && (
                <DetailRow
                  label="Flavour"
                  value={orderItems.map((i) => i.flavour).filter(Boolean).join(", ")}
                />
              )}
              {deliveryDate && <DetailRow label="Delivery Date" value={deliveryDate} />}
              <DetailRow label="Delivery Address" value={order.delivery_address} />
              <DetailRow label="Phone Number" value={order.customer_phone} />
              <DetailRow label="Total Amount" value={`₹${order.total}`} />
              {statusInfo && (
                <div className="flex justify-between items-center gap-3 pt-1">
                  <span className="text-ink/50">Payment Status</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </div>
              )}
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Link
              href={`/account/orders/${orderId}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brown text-brown font-semibold px-6 py-3 hover:bg-brown hover:text-cream-light transition-colors"
            >
              <FiPackage /> Track Order
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
            >
              <FaWhatsapp /> Order on WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button href="/menu" variant="ghost">
              Continue Shopping
            </Button>
            <Button href="/" variant="ghost">
              Back to Home
            </Button>
          </div>

          <p className="text-xs text-ink/40 pt-1">
            <a href={`tel:+91${business.phones[0]}`} className="inline-flex items-center gap-1 hover:text-rose">
              <FiPhone size={12} /> Need help? Call us
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4">
      <span className="text-ink/50 shrink-0">{label}</span>
      <span className="font-semibold text-ink text-right">{value}</span>
    </p>
  );
}
