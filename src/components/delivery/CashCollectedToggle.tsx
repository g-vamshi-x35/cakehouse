"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { markCashCollectedAction } from "@/lib/actions/delivery";

export default function CashCollectedToggle({
  orderId,
  initialCollected,
  remainingAmount,
}: {
  orderId: string;
  initialCollected: boolean;
  remainingAmount: number;
}) {
  const [collected, setCollected] = useState(initialCollected);
  const [pending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    setCollected(checked);
    startTransition(async () => {
      await markCashCollectedAction(orderId, checked);
      toast.success(checked ? "Marked cash collected" : "Marked cash not yet collected");
    });
  }

  if (remainingAmount <= 0) return null;

  return (
    <label className="flex items-center gap-2.5 text-sm text-ink/80 cursor-pointer">
      <input
        type="checkbox"
        checked={collected}
        disabled={pending}
        onChange={(e) => handleChange(e.target.checked)}
        className="w-4 h-4 accent-rose"
      />
      Collected ₹{remainingAmount} cash on delivery
    </label>
  );
}
