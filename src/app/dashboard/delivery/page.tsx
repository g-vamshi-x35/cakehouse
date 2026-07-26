import Link from "next/link";
import { FiMapPin, FiPhone, FiStar } from "react-icons/fi";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminUI";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import DeliveryStatusButtons from "@/components/delivery/DeliveryStatusButtons";
import OnlineToggle from "@/components/delivery/OnlineToggle";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

const ACTIVE_STATUSES: OrderStatus[] = ["confirmed", "baking", "ready", "out_for_delivery"];

export default async function DeliveryTodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("is_online").eq("id", user!.id).maybeSingle(),
    supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_phone, delivery_address, delivery_charge, delivery_distance_km, order_status, total, order_items ( product_name, products ( avg_rating, review_count ) )"
      )
      .eq("assigned_delivery_id", user!.id)
      .in("order_status", ACTIVE_STATUSES)
      .order("delivery_distance_km", { ascending: true, nullsFirst: false }),
  ]);

  const list = orders ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Today"
        description={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        action={<OnlineToggle initialOnline={profile?.is_online ?? false} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Assigned to You" value={list.length} />
        <StatCard label="Out for Delivery" value={list.filter((o) => o.order_status === "out_for_delivery").length} />
      </div>

      <div className="space-y-3">
        {list.map((order) => {
          const item = Array.isArray(order.order_items) ? order.order_items[0] : order.order_items;
          const product = item && (Array.isArray(item.products) ? item.products[0] : item.products);
          return (
            <div key={order.id} className="bg-cream rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-brown">
                    #{order.order_number} — {item?.product_name}
                  </p>
                  {product?.review_count ? (
                    <p className="text-xs text-ink/50 flex items-center gap-1">
                      <FiStar className="fill-amber-400 text-amber-400" /> {product.avg_rating} (
                      {product.review_count} reviews)
                    </p>
                  ) : null}
                  <p className="text-sm text-ink/70 mt-1">{order.customer_name}</p>
                  <a
                    href={`tel:+91${order.customer_phone}`}
                    className="text-xs text-ink/60 hover:text-rose flex items-center gap-1 mt-0.5"
                  >
                    <FiPhone size={11} /> {order.customer_phone}
                  </a>
                  <p className="text-xs text-ink/50 flex items-start gap-1 mt-1">
                    <FiMapPin size={11} className="mt-0.5 shrink-0" /> {order.delivery_address}
                    {order.delivery_distance_km != null && (
                      <span className="text-ink/40 shrink-0"> · ~{order.delivery_distance_km.toFixed(1)} km</span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <OrderStatusBadge status={order.order_status} />
                  <p className="text-sm font-semibold text-brown mt-1">₹{order.total}</p>
                </div>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <DeliveryStatusButtons orderId={order.id} currentStatus={order.order_status} />
                <Link href={`/dashboard/delivery/orders/${order.id}`} className="text-rose font-semibold text-sm hover:text-brown">
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="text-sm text-ink/50 bg-cream rounded-2xl p-8 text-center">
            No deliveries assigned to you right now. 🎉
          </p>
        )}
      </div>
    </div>
  );
}
