import { AdminPageHeader, AdminTable, StatCard } from "@/components/admin/AdminUI";
import CashCollectedToggle from "@/components/delivery/CashCollectedToggle";
import { createClient } from "@/lib/supabase/server";

export default async function DeliveryCashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, advance_amount, cash_collected, updated_at")
    .eq("assigned_delivery_id", user!.id)
    .eq("order_status", "delivered")
    .order("updated_at", { ascending: false });

  const rows = (orders ?? []).map((o) => ({ ...o, remaining: Math.max(0, o.total - o.advance_amount) }));
  const owed = rows.filter((r) => !r.cash_collected).reduce((sum, r) => sum + r.remaining, 0);
  const collected = rows.filter((r) => r.cash_collected).reduce((sum, r) => sum + r.remaining, 0);

  return (
    <div>
      <AdminPageHeader title="Cash Reconciliation" description="Balance due on delivery, from your completed orders" />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Still to Collect" value={`₹${owed}`} />
        <StatCard label="Collected — Hand Over" value={`₹${collected}`} />
      </div>

      <AdminTable columns={["Order", "Customer", "Remaining", "Cash Status"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3 font-semibold text-ink">#{r.order_number}</td>
            <td className="px-4 py-3">{r.customer_name}</td>
            <td className="px-4 py-3">₹{r.remaining}</td>
            <td className="px-4 py-3">
              <CashCollectedToggle orderId={r.id} initialCollected={r.cash_collected} remainingAmount={r.remaining} />
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
              No delivered orders yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
