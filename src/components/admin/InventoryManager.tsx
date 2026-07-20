"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addInventoryItemAction,
  updateInventoryQtyAction,
  deleteInventoryItemAction,
  type ActionState,
} from "@/lib/actions/admin";
import { inputClasses, AdminTable } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  low_stock_threshold: number | null;
};

function QtyEditor({ item }: { item: InventoryItem }) {
  const [qty, setQty] = useState(item.quantity);
  const [, startTransition] = useTransition();
  const low = item.low_stock_threshold != null && qty <= item.low_stock_threshold;

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        onBlur={() => startTransition(() => updateInventoryQtyAction(item.id, qty))}
        className="w-20 rounded-lg border border-brown/20 bg-cream-light px-2 py-1 text-sm"
      />
      <span className="text-xs text-ink/50">{item.unit}</span>
      {low && <span className="text-[10px] font-bold uppercase text-red-600">Low</span>}
    </div>
  );
}

export default function InventoryManager({
  items,
  canDelete = false,
}: {
  items: InventoryItem[];
  canDelete?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addInventoryItemAction,
    null
  );

  return (
    <div className="space-y-6">
      <AdminTable columns={["Item", "Quantity", canDelete ? "" : ""]}>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 font-semibold text-ink">{item.name}</td>
            <td className="px-4 py-3">
              <QtyEditor item={item} />
            </td>
            <td className="px-4 py-3">
              {canDelete && (
                <DeleteButton
                  action={() => deleteInventoryItemAction(item.id)}
                  confirmMessage={`Remove "${item.name}" from inventory?`}
                />
              )}
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr>
            <td colSpan={3} className="px-4 py-8 text-center text-ink/50">
              No inventory items yet.
            </td>
          </tr>
        )}
      </AdminTable>

      {canDelete && (
        <form action={formAction} className="bg-cream rounded-2xl p-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-ink/50 mb-1 block px-1">Item Name</label>
            <input name="name" required className={inputClasses} />
          </div>
          <div className="w-24">
            <label className="text-xs text-ink/50 mb-1 block px-1">Unit</label>
            <input name="unit" defaultValue="kg" className={inputClasses} />
          </div>
          <div className="w-28">
            <label className="text-xs text-ink/50 mb-1 block px-1">Quantity</label>
            <input name="quantity" type="number" defaultValue={0} className={inputClasses} />
          </div>
          <div className="w-36">
            <label className="text-xs text-ink/50 mb-1 block px-1">Low Stock At</label>
            <input name="lowStockThreshold" type="number" defaultValue={5} className={inputClasses} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-rose text-white text-sm font-semibold px-5 py-2.5 hover:bg-brown transition-colors disabled:opacity-60"
          >
            {pending ? "Adding..." : "Add Item"}
          </button>
          {state?.error && <p className="text-sm text-red-600 w-full">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
