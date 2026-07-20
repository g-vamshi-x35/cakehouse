import Link from "next/link";
import { FiPackage } from "react-icons/fi";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total, order_status, payment_status, created_at")
    .eq("customer_id", user!.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-cream rounded-3xl p-10 text-center">
        <FiPackage className="mx-auto text-4xl text-brown/30 mb-3" />
        <p className="text-ink/60 mb-5">You haven&apos;t placed any orders yet.</p>
        <Link href="/menu" className="text-rose font-semibold hover:text-brown">
          Browse the menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex items-center justify-between bg-cream rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div>
            <p className="font-semibold text-brown">#{order.order_number}</p>
            <p className="text-xs text-ink/50">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-ink mb-1">₹{order.total}</p>
            <OrderStatusBadge status={order.order_status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
