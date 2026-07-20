"use client";

import { useActionState, useTransition } from "react";
import Image from "next/image";
import { quoteCustomCakeAction, updateCustomCakeStatusAction, type ActionState } from "@/lib/actions/admin";
import { inputClasses } from "@/components/admin/AdminUI";

type Request = {
  id: string;
  customer_name: string;
  customer_phone: string;
  shape: string | null;
  size: string | null;
  layers: number | null;
  flavour: string | null;
  cream_type: string | null;
  theme: string | null;
  inspiration_image_url: string | null;
  instructions: string | null;
  event_date: string | null;
  status: string;
  quoted_price: number | null;
  created_at: string;
};

export default function CustomCakeRequestCard({ request }: { request: Request }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    quoteCustomCakeAction,
    null
  );
  const [, startTransition] = useTransition();

  return (
    <div className="bg-cream rounded-2xl p-6 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5">
      {request.inspiration_image_url && (
        <div className="relative w-full md:w-32 aspect-square rounded-xl overflow-hidden bg-cream-light shrink-0">
          <Image src={request.inspiration_image_url} alt="Inspiration" fill className="object-cover" />
        </div>
      )}

      <div className="text-sm space-y-1">
        <p className="font-semibold text-brown">
          {request.customer_name} · {request.customer_phone}
        </p>
        <p className="text-ink/60">
          {[request.shape, request.size, request.layers && `${request.layers} layers`, request.flavour, request.cream_type, request.theme]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {request.instructions && <p className="text-ink/50 italic">&ldquo;{request.instructions}&rdquo;</p>}
        {request.event_date && <p className="text-xs text-ink/40">Needed: {request.event_date}</p>}
        <span
          className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
            request.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : request.status === "quoted"
              ? "bg-blue-100 text-blue-700"
              : request.status === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {request.status}
        </span>
      </div>

      <div className="min-w-[220px]">
        {request.quoted_price ? (
          <p className="text-sm font-semibold text-brown mb-2">Quoted: ₹{request.quoted_price}</p>
        ) : (
          <form action={formAction} className="space-y-2">
            <input type="hidden" name="requestId" value={request.id} />
            <input name="quotedPrice" type="number" placeholder="Quote price (₹)" className={inputClasses} />
            <input name="ownerNotes" placeholder="Notes for customer" className={inputClasses} />
            {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-rose text-white text-xs font-semibold py-2 hover:bg-brown transition-colors"
            >
              {pending ? "Sending..." : "Send Quote"}
            </button>
          </form>
        )}
        {request.status !== "approved" && request.status !== "rejected" && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => startTransition(() => updateCustomCakeStatusAction(request.id, "approved"))}
              className="flex-1 text-xs font-semibold rounded-full bg-green-600 text-white py-1.5 hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => startTransition(() => updateCustomCakeStatusAction(request.id, "rejected"))}
              className="flex-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 py-1.5 hover:bg-red-200"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
