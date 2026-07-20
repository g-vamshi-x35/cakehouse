"use client";

import { useTransition } from "react";
import { markMessageReadAction } from "@/lib/actions/admin";

type Message = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function MessageList({ messages }: { messages: Message[] }) {
  const [, startTransition] = useTransition();

  if (messages.length === 0) {
    return <p className="text-sm text-ink/50 bg-cream rounded-2xl p-8 text-center">No messages yet.</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-2xl p-5 ${m.is_read ? "bg-cream" : "bg-cream border-2 border-rose/40"}`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <p className="font-semibold text-brown">{m.subject || "No subject"}</p>
            <span className="text-xs text-ink/40">
              {new Date(m.created_at).toLocaleDateString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-ink/50 mb-2">
            {m.name} · {m.email} {m.phone && `· ${m.phone}`}
          </p>
          <p className="text-sm text-ink/70">{m.message}</p>
          {!m.is_read && (
            <button
              onClick={() => startTransition(() => markMessageReadAction(m.id))}
              className="mt-3 text-xs font-semibold text-rose hover:text-brown"
            >
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
