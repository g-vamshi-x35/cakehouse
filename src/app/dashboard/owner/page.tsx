import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiGift } from "react-icons/fi";
import { AdminPageHeader, StatCard, AdminCard } from "@/components/admin/AdminUI";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { createClient } from "@/lib/supabase/server";
import { buildWhatsAppLinkToNumber } from "@/lib/whatsapp";
import { business } from "@/data/business";

export default async function OwnerOverviewPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: todayOrders },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: revenueRows },
    { data: recentOrders },
    { data: birthdayCandidates },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("order_status", ["pending", "confirmed", "baking"]),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("total, created_at").gte("created_at", todayStart.toISOString()),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, order_status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("profiles").select("id, full_name, phone, birthday").eq("role", "customer").not("birthday", "is", null),
  ]);

  const todayRevenue = (revenueRows ?? []).reduce((sum, r) => sum + Number(r.total), 0);

  const now = new Date();
  const todaysBirthdays = (birthdayCandidates ?? []).filter((c) => {
    if (!c.birthday) return false;
    const [, month, day] = c.birthday.split("-").map(Number);
    return month === now.getMonth() + 1 && day === now.getDate();
  });

  return (
    <div>
      <AdminPageHeader title="Dashboard Overview" description="Today at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's Orders" value={todayOrders ?? 0} />
        <StatCard label="Today's Revenue" value={`₹${todayRevenue}`} />
        <StatCard label="Orders In Progress" value={pendingOrders ?? 0} />
        <StatCard label="Total Customers" value={totalCustomers ?? 0} />
      </div>

      {todaysBirthdays.length > 0 && (
        <AdminCard className="mb-6 border-2 border-rose/30">
          <div className="flex items-center gap-2 mb-4">
            <FiGift className="text-rose" />
            <h2 className="font-heading text-lg text-brown">Birthdays Today 🎂</h2>
          </div>
          <div className="space-y-2">
            {todaysBirthdays.map((c) => {
              const message = `Hi ${c.full_name || "there"}! 🎂 Happy Birthday from all of us at ${business.name}! Treat yourself to a cake today — reply here or order on the website.`;
              return (
                <div key={c.id} className="flex items-center justify-between bg-cream-light rounded-xl px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm text-ink">{c.full_name || "Customer"}</p>
                    <p className="text-xs text-ink/50">{c.phone}</p>
                  </div>
                  {c.phone && (
                    <a
                      href={buildWhatsAppLinkToNumber(c.phone, message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-[#25D366] text-white px-3 py-1.5 hover:opacity-90 transition-opacity"
                    >
                      <FaWhatsapp /> Send Wishes
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

      <AdminCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg text-brown">Recent Orders</h2>
          <Link href="/dashboard/owner/orders" className="text-sm text-rose font-semibold hover:text-brown">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {(recentOrders ?? []).map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/owner/orders/${order.id}`}
              className="flex items-center justify-between bg-cream-light rounded-xl px-4 py-3 hover:bg-brown/5 transition-colors"
            >
              <div>
                <p className="font-semibold text-sm text-ink">#{order.order_number}</p>
                <p className="text-xs text-ink/50">{order.customer_name}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className="font-bold text-sm">₹{order.total}</span>
                <OrderStatusBadge status={order.order_status} />
              </div>
            </Link>
          ))}
          {(!recentOrders || recentOrders.length === 0) && (
            <p className="text-sm text-ink/50 text-center py-6">No orders yet.</p>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
