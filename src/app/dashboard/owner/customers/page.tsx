import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("id, full_name, phone, birthday, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  const { data: orderCounts } = await supabase.from("orders").select("customer_id, total");
  const statsByCustomer = new Map<string, { count: number; total: number }>();
  (orderCounts ?? []).forEach((o) => {
    if (!o.customer_id) return;
    const prev = statsByCustomer.get(o.customer_id) ?? { count: 0, total: 0 };
    statsByCustomer.set(o.customer_id, { count: prev.count + 1, total: prev.total + Number(o.total) });
  });

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers?.length ?? 0} registered customers`} />
      <AdminTable columns={["Name", "Phone", "Birthday", "Orders", "Total Spent"]}>
        {(customers ?? []).map((c) => {
          const stats = statsByCustomer.get(c.id) ?? { count: 0, total: 0 };
          return (
            <tr key={c.id}>
              <td className="px-4 py-3 font-semibold text-ink">{c.full_name || "—"}</td>
              <td className="px-4 py-3 text-ink/60">{c.phone || "—"}</td>
              <td className="px-4 py-3 text-ink/60">{c.birthday || "—"}</td>
              <td className="px-4 py-3">{stats.count}</td>
              <td className="px-4 py-3 font-semibold">₹{stats.total}</td>
            </tr>
          );
        })}
        {(!customers || customers.length === 0) && (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
              No customers yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
