"use client";

import { useActionState } from "react";
import { addCategoryAction, deleteCategoryAction, type ActionState } from "@/lib/actions/admin";
import { inputClasses } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

type Category = { id: string; name: string; slug: string };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addCategoryAction,
    null
  );

  return (
    <div className="space-y-6">
      <div className="bg-cream rounded-2xl divide-y divide-brown/10">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-semibold text-ink">{c.name}</p>
              <p className="text-xs text-ink/40">/{c.slug}</p>
            </div>
            <DeleteButton action={() => deleteCategoryAction(c.id)} confirmMessage={`Delete category "${c.name}"?`} />
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-ink/50 text-center py-6">No categories yet.</p>}
      </div>

      <form action={formAction} className="bg-cream rounded-2xl p-6 flex flex-wrap gap-3 items-end max-w-lg">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink/50 mb-1 block px-1">Name</label>
          <input name="name" required className={inputClasses} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink/50 mb-1 block px-1">Slug</label>
          <input name="slug" required className={inputClasses} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose text-white text-sm font-semibold px-5 py-2.5 hover:bg-brown transition-colors disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
