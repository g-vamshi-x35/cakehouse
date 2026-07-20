import { notFound } from "next/navigation";
import Link from "next/link";
import { FiPrinter } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import OrderControls from "@/components/admin/OrderControls";
import { createClient } from "@/lib/supabase/server";

export default async function OwnerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: employees }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("order_items")
      .select("product_name, weight_label, flavour, custom_message, quantity, unit_price, line_total")
      .eq("order_id", id),
    supabase.from("profiles").select("id, full_name").in("role", ["employee", "owner"]),
  ]);

  if (!order) notFound();

  return (
    <div>
      <AdminPageHeader
        title={`Order #${order.order_number}`}
        description={new Date(order.created_at).toLocaleString("en-IN")}
        action={
          <Link
            href={`/api/invoices/${order.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brown text-brown text-sm font-semibold px-5 py-2.5 hover:bg-brown hover:text-cream-light transition-colors"
          >
            <FiPrinter /> Invoice
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-cream rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-brown">Items</h2>
              <OrderStatusBadge status={order.order_status} />
            </div>
            <div className="space-y-3">
              {(items ?? []).map((item, i) => (
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
            <div className="border-t border-brown/15 mt-4 pt-4 space-y-1 text-sm">
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
              <div className="flex justify-between text-ink/50 text-xs">
                <span>Advance / Paid Method</span>
                <span className="capitalize">
                  ₹{order.advance_amount} via {order.payment_method.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-cream rounded-2xl p-6 space-y-3 text-sm">
            <h2 className="font-heading text-lg text-brown mb-1">Customer &amp; Delivery</h2>
            <p>
              <span className="text-ink/50">Name:</span> {order.customer_name}
            </p>
            <p>
              <span className="text-ink/50">Phone:</span>{" "}
              <a href={`tel:+91${order.customer_phone}`} className="text-rose hover:text-brown">
                {order.customer_phone}
              </a>
            </p>
            {order.customer_email && (
              <p>
                <span className="text-ink/50">Email:</span> {order.customer_email}
              </p>
            )}
            <p>
              <span className="text-ink/50">Address:</span> {order.delivery_address}
            </p>
            {order.delivery_instructions && (
              <p>
                <span className="text-ink/50">Instructions:</span> {order.delivery_instructions}
              </p>
            )}
            {order.event_date && (
              <p>
                <span className="text-ink/50">Needed on:</span> {order.event_date}{" "}
                {order.event_time && `at ${order.event_time}`}
              </p>
            )}
          </div>
        </div>

        <OrderControls
          orderId={order.id}
          currentStatus={order.order_status}
          paymentStatus={order.payment_status}
          assignedEmployeeId={order.assigned_employee_id}
          employees={employees ?? []}
          canAssign
        />
      </div>
    </div>
  );
}
