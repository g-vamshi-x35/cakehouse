import { notFound } from "next/navigation";
import Link from "next/link";
import { FiCheck, FiPrinter } from "react-icons/fi";
import OrderStatusBadge, {
  ORDER_STATUS_STEPS,
  ORDER_STATUS_LABELS,
} from "@/components/account/OrderStatusBadge";
import ReorderButton from "@/components/account/ReorderButton";
import { createClient } from "@/lib/supabase/server";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, subtotal, discount, advance_amount, delivery_address, delivery_instructions, event_date, event_time, order_status, payment_status, payment_method, created_at"
    )
    .eq("id", id)
    .eq("customer_id", user!.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, product_name, weight_label, flavour, custom_message, quantity, unit_price, line_total")
    .eq("order_id", id);

  const isCancelled = order.order_status === "cancelled";
  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.order_status);

  return (
    <div className="space-y-6">
      <div className="bg-cream rounded-3xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="font-heading text-2xl text-brown">Order #{order.order_number}</h2>
            <p className="text-xs text-ink/50">
              {new Date(order.created_at).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.order_status} />
            <Link
              href={`/api/invoices/${order.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brown/60 hover:text-rose transition-colors"
            >
              <FiPrinter size={13} /> Invoice
            </Link>
          </div>
        </div>

        {!isCancelled && (
          <div className="flex items-center mb-8 overflow-x-auto pb-2">
            {ORDER_STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStepIndex ? "bg-rose text-white" : "bg-cream-light text-ink/30"
                    }`}
                  >
                    {i < currentStepIndex ? <FiCheck /> : i + 1}
                  </div>
                  <span className="text-[10px] text-ink/50 w-16 text-center">
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </div>
                {i < ORDER_STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 md:w-16 ${i < currentStepIndex ? "bg-rose" : "bg-cream-light"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div>
                <p className="font-semibold text-ink">
                  {item.product_name} x{item.quantity}
                </p>
                <p className="text-xs text-ink/50">
                  {[item.weight_label, item.flavour].filter(Boolean).join(" · ")}
                </p>
                {item.custom_message && (
                  <p className="text-xs text-ink/40 italic">&ldquo;{item.custom_message}&rdquo;</p>
                )}
              </div>
              <span className="font-semibold">₹{item.line_total}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-brown/15 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink/70">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-brown">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-brown/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink/50 mb-1">Delivery Address</p>
            <p>{order.delivery_address}</p>
          </div>
          {order.event_date && (
            <div>
              <p className="text-ink/50 mb-1">Needed On</p>
              <p>
                {order.event_date} {order.event_time && `at ${order.event_time}`}
              </p>
            </div>
          )}
        </div>
      </div>

      <ReorderButton items={items ?? []} />
    </div>
  );
}
