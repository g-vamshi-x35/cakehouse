import Link from "next/link";
import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "baking",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default async function OwnerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, total, order_status, payment_status, created_at")
    .order("created_at", { ascending: false });

  const validStatus = VALID_STATUSES.find((s) => s === status);
  if (validStatus) query = query.eq("order_status", validStatus);

  const { data: orders } = await query;

  const statuses = VALID_STATUSES;

  return (
    <div>
      <AdminPageHeader title="Orders" description="All customer orders" />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/dashboard/owner/orders"
          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${!status ? "bg-brown text-cream-light" : "bg-cream text-brown"}`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/dashboard/owner/orders?status=${s}`}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${status === s ? "bg-brown text-cream-light" : "bg-cream text-brown"}`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <AdminTable columns={["Order", "Customer", "Total", "Payment", "Status", ""]}>
        {(orders ?? []).map((order) => (
          <tr key={order.id}>
            <td className="px-4 py-3 font-semibold text-ink">#{order.order_number}</td>
            <td className="px-4 py-3">
              <p className="text-ink">{order.customer_name}</p>
              <p className="text-xs text-ink/40">{order.customer_phone}</p>
            </td>
            <td className="px-4 py-3">₹{order.total}</td>
            <td className="px-4 py-3 text-xs capitalize text-ink/60">{order.payment_status.replace(/_/g, " ")}</td>
            <td className="px-4 py-3">
              <OrderStatusBadge status={order.order_status} />
            </td>
            <td className="px-4 py-3">
              <Link href={`/dashboard/owner/orders/${order.id}`} className="text-rose font-semibold hover:text-brown">
                View →
              </Link>
            </td>
          </tr>
        ))}
        {(!orders || orders.length === 0) && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
              No orders found.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
