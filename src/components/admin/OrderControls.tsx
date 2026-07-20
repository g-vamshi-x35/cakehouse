"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import {
  updateOrderStatusAction,
  confirmAdvancePaymentAction,
  assignEmployeeAction,
} from "@/lib/actions/admin";
import type { OrderStatus } from "@/lib/supabase/types";
import { ORDER_STATUS_STEPS, ORDER_STATUS_LABELS } from "@/components/account/OrderStatusBadge";
import { inputClasses } from "@/components/admin/AdminUI";

type Employee = { id: string; full_name: string | null };

export default function OrderControls({
  orderId,
  currentStatus,
  paymentStatus,
  assignedEmployeeId,
  employees,
  canAssign,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  paymentStatus: string;
  assignedEmployeeId: string | null;
  employees: Employee[];
  canAssign: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="bg-cream rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase text-ink/50 mb-2">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUS_STEPS.map((status) => (
            <button
              key={status}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await updateOrderStatusAction(orderId, status);
                  toast.success(`Status updated to ${ORDER_STATUS_LABELS[status]}`);
                })
              }
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                currentStatus === status ? "bg-rose text-white" : "bg-cream-light text-brown hover:bg-brown/10"
              }`}
            >
              {ORDER_STATUS_LABELS[status]}
            </button>
          ))}
          <button
            disabled={pending}
            onClick={() => startTransition(() => updateOrderStatusAction(orderId, "cancelled"))}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              currentStatus === "cancelled" ? "bg-red-600 text-white" : "bg-cream-light text-red-600 hover:bg-red-50"
            }`}
          >
            Cancel Order
          </button>
        </div>
      </div>

      {paymentStatus === "advance_pending" && (
        <div>
          <p className="text-xs font-semibold uppercase text-ink/50 mb-2">Payment</p>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await confirmAdvancePaymentAction(orderId);
                toast.success("Advance payment confirmed");
              })
            }
            className="text-xs font-semibold px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Confirm Advance Received
          </button>
        </div>
      )}

      {canAssign && (
        <div>
          <p className="text-xs font-semibold uppercase text-ink/50 mb-2">Assign Employee</p>
          <select
            defaultValue={assignedEmployeeId ?? ""}
            onChange={(e) => startTransition(() => assignEmployeeAction(orderId, e.target.value))}
            className={inputClasses}
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name || "Employee"}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
