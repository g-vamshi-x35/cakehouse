"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { toggleOnlineStatusAction } from "@/lib/actions/delivery";

export default function OnlineToggle({ initialOnline }: { initialOnline: boolean }) {
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !isOnline;
    setIsOnline(next);
    startTransition(async () => {
      await toggleOnlineStatusAction(next);
      toast.success(next ? "You're online" : "You're offline");
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
        isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
      {isOnline ? "Online" : "Offline"}
    </button>
  );
}
