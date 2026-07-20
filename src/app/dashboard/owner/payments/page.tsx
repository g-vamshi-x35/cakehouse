import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import { createClient } from "@/lib/supabase/server";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, method, status, razorpay_payment_id, created_at, orders ( order_number )")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <AdminPageHeader title="Payments" description="All payment records" />
      <AdminTable columns={["Order", "Amount", "Method", "Status", "Reference", "Date"]}>
        {(payments ?? []).map((p) => {
          const order = Array.isArray(p.orders) ? p.orders[0] : p.orders;
          return (
            <tr key={p.id}>
              <td className="px-4 py-3 font-semibold text-ink">#{order?.order_number ?? "—"}</td>
              <td className="px-4 py-3">₹{p.amount}</td>
              <td className="px-4 py-3 capitalize">{p.method.replace(/_/g, " ")}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    p.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-ink/40">{p.razorpay_payment_id ?? "—"}</td>
              <td className="px-4 py-3 text-xs text-ink/50">
                {new Date(p.created_at).toLocaleDateString("en-IN")}
              </td>
            </tr>
          );
        })}
        {(!payments || payments.length === 0) && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
              No payment records yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
