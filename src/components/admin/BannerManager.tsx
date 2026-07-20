"use client";

import { useActionState, useTransition } from "react";
import Image from "next/image";
import { addBannerAction, toggleBannerActiveAction, deleteBannerAction, type ActionState } from "@/lib/actions/admin";
import { inputClasses } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  is_active: boolean;
};

export default function BannerManager({ banners }: { banners: Banner[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addBannerAction,
    null
  );
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-cream rounded-2xl overflow-hidden">
            {b.image_url && (
              <div className="relative aspect-video bg-cream-light">
                <Image src={b.image_url} alt={b.title ?? ""} fill className="object-cover" />
              </div>
            )}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">{b.title || "Untitled banner"}</p>
                <p className="text-xs text-ink/50">{b.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startTransition(() => toggleBannerActiveAction(b.id, b.is_active))}
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${b.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {b.is_active ? "Live" : "Hidden"}
                </button>
                <DeleteButton action={() => deleteBannerAction(b.id)} confirmMessage="Delete this banner?" />
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-sm text-ink/50 col-span-2">No banners yet.</p>
        )}
      </div>

      <form action={formAction} className="bg-cream rounded-2xl p-6 space-y-3 max-w-lg">
        <h3 className="font-heading text-lg text-brown">Add Banner</h3>
        <input name="title" placeholder="Title" className={inputClasses} />
        <input name="subtitle" placeholder="Subtitle" className={inputClasses} />
        <input name="imageUrl" placeholder="Image URL (/images/...)" required className={inputClasses} />
        <input name="linkUrl" placeholder="Link URL (optional)" className={inputClasses} />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose text-white font-semibold px-6 py-2.5 text-sm hover:bg-brown transition-colors disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add Banner"}
        </button>
      </form>
    </div>
  );
}
