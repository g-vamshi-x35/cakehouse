"use client";

import { useTransition } from "react";
import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function DeleteButton({
  action,
  confirmMessage = "Are you sure?",
}: {
  action: () => Promise<void> | void;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(async () => {
            await action();
            toast.success("Deleted");
          });
        }
      }}
      disabled={pending}
      aria-label="Delete"
      className="text-brown/40 hover:text-red-600 transition-colors disabled:opacity-40"
    >
      <FiTrash2 size={15} />
    </button>
  );
}
