import { notFound } from "next/navigation";
import { FiStar } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import DeliveryStatusButtons from "@/components/delivery/DeliveryStatusButtons";
import CashCollectedToggle from "@/components/delivery/CashCollectedToggle";
import DeliveryRatingForm from "@/components/delivery/DeliveryRatingForm";
import { createClient } from "@/lib/supabase/server";

export default async function DeliveryOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("order_items")
      .select("product_name, weight_label, flavour, custom_message, quantity, unit_price, line_total, products ( avg_rating, review_count )")
      .eq("order_id", id),
  ]);

  if (!order) notFound();

  const remaining = Math.max(0, order.total - order.advance_amount);
  const mapSrc =
    order.delivery_lat != null && order.delivery_lng != null
      ? `https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}&output=embed`
      : null;

  return (
    <div>
      <AdminPageHeader
        title={`Order #${order.order_number}`}
        description={new Date(order.created_at).toLocaleString("en-IN")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-cream rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-brown">Items</h2>
              <OrderStatusBadge status={order.order_status} />
            </div>
            <div className="space-y-3">
              {(items ?? []).map((item, i) => {
                const product = Array.isArray(item.products) ? item.products[0] : item.products;
                return (
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
                      {product?.review_count ? (
                        <p className="text-xs text-ink/50 flex items-center gap-1 mt-0.5">
                          <FiStar className="fill-amber-400 text-amber-400" size={11} /> {product.avg_rating} (
                          {product.review_count})
                        </p>
                      ) : null}
                    </div>
                    <span className="font-semibold">₹{item.line_total}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-brown/15 mt-4 pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-ink/70">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.delivery_charge > 0 && (
                <div className="flex justify-between text-ink/70">
                  <span>
                    Delivery Charge{order.delivery_distance_km != null && ` (${order.delivery_distance_km.toFixed(1)} km)`}
                  </span>
                  <span>₹{order.delivery_charge}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-brown">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
              <div className="flex justify-between text-ink/50 text-xs">
                <span>Advance Paid / Remaining</span>
                <span>
                  ₹{order.advance_amount} / ₹{remaining}
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
            {mapSrc && (
              <div className="rounded-xl overflow-hidden aspect-video mt-3">
                <iframe src={mapSrc} title="Delivery location" className="w-full h-full border-0" loading="lazy" />
              </div>
            )}
          </div>

          {order.order_status === "delivered" && (
            <DeliveryRatingForm
              orderId={order.id}
              initialRating={order.delivery_rating}
              initialNotes={order.delivery_notes}
            />
          )}
        </div>

        <div className="bg-cream rounded-2xl p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase text-ink/50 mb-2">Update Status</p>
            <DeliveryStatusButtons orderId={order.id} currentStatus={order.order_status} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-ink/50 mb-2">Cash</p>
            <CashCollectedToggle
              orderId={order.id}
              initialCollected={order.cash_collected}
              remainingAmount={remaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
