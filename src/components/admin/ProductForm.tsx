"use client";

import { useActionState } from "react";
import { saveProductAction, type ActionState } from "@/lib/actions/admin";
import { inputClasses } from "@/components/admin/AdminUI";

type Category = { id: string; name: string };

export default function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    category_id: string | null;
    description: string | null;
    ingredients: string | null;
    price_500: number | null;
    price_1000: number | null;
    base_price: number | null;
    is_featured: boolean;
    is_active: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveProductAction,
    null
  );

  return (
    <form action={formAction} className="bg-cream rounded-2xl p-6 space-y-4 max-w-2xl">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Name</label>
          <input name="name" defaultValue={product?.name} required className={inputClasses} />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Slug (URL)</label>
          <input name="slug" defaultValue={product?.slug} required className={inputClasses} />
        </div>
      </div>

      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Category</label>
        <select name="categoryId" defaultValue={product?.category_id ?? ""} className={inputClasses}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Description</label>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={2}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Ingredients</label>
        <textarea
          name="ingredients"
          defaultValue={product?.ingredients ?? ""}
          rows={2}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Price (0.5kg)</label>
          <input name="price500" type="number" defaultValue={product?.price_500 ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Price (1kg)</label>
          <input name="price1000" type="number" defaultValue={product?.price_1000 ?? ""} className={inputClasses} />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Base Price (snacks)</label>
          <input name="basePrice" type="number" defaultValue={product?.base_price ?? ""} className={inputClasses} />
        </div>
      </div>

      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Add Image URL</label>
        <input name="imageUrl" placeholder="/images/menu/example.jpg" className={inputClasses} />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.is_featured} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="isActive" defaultChecked={product?.is_active ?? true} /> Active
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rose text-white font-semibold px-6 py-3 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}
