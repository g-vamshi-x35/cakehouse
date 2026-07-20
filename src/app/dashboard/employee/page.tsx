import Link from "next/link";
import { FiPrinter } from "react-icons/fi";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminUI";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeTodayPage() {
  const supabase = await createClient();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [{ data: todayOrders }, { count: activeCount }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, delivery_address, event_date, event_time, order_status, total")
      .eq("event_date", todayStr)
      .order("event_time", { ascending: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("order_status", ["pending", "confirmed", "baking"]),
  ]);

  return (
    <div>
      <AdminPageHeader title="Today's Orders" description={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Due Today" value={todayOrders?.length ?? 0} />
        <StatCard label="Active Orders" value={activeCount ?? 0} />
      </div>

      <div className="space-y-3">
        {(todayOrders ?? []).map((order) => (
          <div key={order.id} className="bg-cream rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-brown">#{order.order_number}</p>
              <p className="text-sm text-ink/70">{order.customer_name} · {order.customer_phone}</p>
              <p className="text-xs text-ink/50">{order.delivery_address}</p>
              {order.event_time && <p className="text-xs text-rose font-semibold">Due at {order.event_time}</p>}
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.order_status} />
              <Link
                href={`/api/invoices/${order.id}`}
                target="_blank"
                className="text-brown/50 hover:text-rose transition-colors"
                aria-label="Print invoice"
              >
                <FiPrinter />
              </Link>
              <Link href={`/dashboard/employee/orders/${order.id}`} className="text-rose font-semibold text-sm hover:text-brown">
                Manage →
              </Link>
            </div>
          </div>
        ))}
        {(!todayOrders || todayOrders.length === 0) && (
          <p className="text-sm text-ink/50 bg-cream rounded-2xl p-8 text-center">Nothing due today. 🎉</p>
        )}
      </div>
    </div>
  );
}
