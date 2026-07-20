"use client";

import { useActionState, useTransition } from "react";
import { addCouponAction, toggleCouponActiveAction, type ActionState } from "@/lib/actions/admin";
import { inputClasses, AdminTable } from "@/components/admin/AdminUI";

type Coupon = {
  id: string;
  code: string;
  discount_type: "flat" | "percent";
  discount_value: number;
  min_order_amount: number;
  used_count: number;
  max_uses: number | null;
  active: boolean;
};

export default function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addCouponAction,
    null
  );
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <AdminTable columns={["Code", "Discount", "Min Order", "Used", "Status", ""]}>
        {coupons.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 font-bold text-brown">{c.code}</td>
            <td className="px-4 py-3">{c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
            <td className="px-4 py-3">₹{c.min_order_amount}</td>
            <td className="px-4 py-3">
              {c.used_count}
              {c.max_uses ? ` / ${c.max_uses}` : ""}
            </td>
            <td className="px-4 py-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {c.active ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => startTransition(() => toggleCouponActiveAction(c.id, c.active))}
                className="text-xs font-semibold text-rose hover:text-brown"
              >
                {c.active ? "Deactivate" : "Activate"}
              </button>
            </td>
          </tr>
        ))}
        {coupons.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
              No coupons yet.
            </td>
          </tr>
        )}
      </AdminTable>

      <form action={formAction} className="bg-cream rounded-2xl p-6 space-y-4 max-w-lg">
        <h3 className="font-heading text-lg text-brown">Create Coupon</h3>
        <input name="code" placeholder="Coupon Code (e.g. SWEET20)" required className={inputClasses} />
        <div className="grid grid-cols-2 gap-3">
          <select name="discountType" defaultValue="flat" className={inputClasses}>
            <option value="flat">Flat ₹ Off</option>
            <option value="percent">% Off</option>
          </select>
          <input name="discountValue" type="number" placeholder="Value" required className={inputClasses} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="minOrderAmount" type="number" placeholder="Min Order Amount" className={inputClasses} />
          <input name="maxUses" type="number" placeholder="Max Uses (optional)" className={inputClasses} />
        </div>
        {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose text-white font-semibold px-6 py-3 hover:bg-brown transition-colors disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create Coupon"}
        </button>
      </form>
    </div>
  );
}
