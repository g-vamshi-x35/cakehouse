"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { updateDeliveryStatusAction } from "@/lib/actions/delivery";
import type { OrderStatus } from "@/lib/supabase/types";
import { ORDER_STATUS_LABELS } from "@/components/account/OrderStatusBadge";

const OPTIONS: { status: OrderStatus; className: string }[] = [
  { status: "out_for_delivery", className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { status: "delivered", className: "bg-green-100 text-green-700 hover:bg-green-200" },
  { status: "cancelled", className: "bg-red-100 text-red-700 hover:bg-red-200" },
];

export default function DeliveryStatusButtons({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.status}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateDeliveryStatusAction(orderId, opt.status);
              toast.success(`Marked ${ORDER_STATUS_LABELS[opt.status]}`);
            })
          }
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
            currentStatus === opt.status ? "ring-2 ring-offset-1 ring-brown/30" : ""
          } ${opt.className}`}
        >
          {ORDER_STATUS_LABELS[opt.status]}
        </button>
      ))}
    </div>
  );
}
