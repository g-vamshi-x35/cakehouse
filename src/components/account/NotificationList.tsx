"use client";

import { useTransition } from "react";
import { FiBell } from "react-icons/fi";
import { markNotificationReadAction } from "@/lib/actions/account";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
  const [, startTransition] = useTransition();

  if (notifications.length === 0) {
    return (
      <div className="bg-cream rounded-3xl p-10 text-center">
        <FiBell className="mx-auto text-4xl text-brown/30 mb-3" />
        <p className="text-ink/60">You&apos;re all caught up — no notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => !n.is_read && startTransition(() => markNotificationReadAction(n.id))}
          className={`w-full text-left rounded-2xl p-5 transition-colors ${
            n.is_read ? "bg-cream" : "bg-cream border-2 border-rose/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-brown">{n.title}</p>
            <span className="text-xs text-ink/40">
              {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
          {n.body && <p className="text-sm text-ink/60 mt-1">{n.body}</p>}
        </button>
      ))}
    </div>
  );
}
