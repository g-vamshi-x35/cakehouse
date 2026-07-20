import { AdminPageHeader, StatCard, AdminCard } from "@/components/admin/AdminUI";
import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("total, order_status, payment_status, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("order_items")
      .select("product_name, quantity, line_total, orders!inner(created_at)")
      .gte("orders.created_at", thirtyDaysAgo.toISOString()),
  ]);

  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders?.length ?? 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const cancelledCount = (orders ?? []).filter((o) => o.order_status === "cancelled").length;

  const productTotals = new Map<string, { qty: number; revenue: number }>();
  (items ?? []).forEach((item) => {
    const prev = productTotals.get(item.product_name) ?? { qty: 0, revenue: 0 };
    productTotals.set(item.product_name, {
      qty: prev.qty + item.quantity,
      revenue: prev.revenue + Number(item.line_total),
    });
  });
  const topProducts = [...productTotals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8);

  const maxRevenue = Math.max(...topProducts.map(([, v]) => v.revenue), 1);

  return (
    <div>
      <AdminPageHeader title="Analytics" description="Last 30 days" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue (30d)" value={`₹${totalRevenue}`} />
        <StatCard label="Orders (30d)" value={totalOrders} />
        <StatCard label="Avg. Order Value" value={`₹${avgOrderValue}`} />
        <StatCard label="Cancelled Orders" value={cancelledCount} />
      </div>

      <AdminCard>
        <h2 className="font-heading text-lg text-brown mb-4">Top Selling Products</h2>
        <div className="space-y-3">
          {topProducts.map(([name, data]) => (
            <div key={name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-ink">
                  {name} <span className="text-ink/40">x{data.qty}</span>
                </span>
                <span className="font-semibold text-brown">₹{data.revenue}</span>
              </div>
              <div className="h-2 rounded-full bg-cream-light overflow-hidden">
                <div
                  className="h-full bg-rose rounded-full"
                  style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {topProducts.length === 0 && <p className="text-sm text-ink/50 text-center py-6">No sales data yet.</p>}
        </div>
      </AdminCard>
    </div>
  );
}
