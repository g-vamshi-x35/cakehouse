"use client";

import { useActionState } from "react";
import { inviteEmployeeAction, removeEmployeeAction, type ActionState } from "@/lib/actions/admin";
import { inputClasses, AdminTable } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

type Employee = { id: string; full_name: string | null; phone: string | null; role: string };

export default function EmployeeManager({ employees }: { employees: Employee[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    inviteEmployeeAction,
    null
  );

  return (
    <div className="space-y-6">
      <AdminTable columns={["Name", "Phone", "Role", ""]}>
        {employees.map((emp) => (
          <tr key={emp.id}>
            <td className="px-4 py-3 font-semibold text-ink">{emp.full_name || "—"}</td>
            <td className="px-4 py-3 text-ink/60">{emp.phone || "—"}</td>
            <td className="px-4 py-3 capitalize">{emp.role}</td>
            <td className="px-4 py-3">
              <DeleteButton
                action={() => removeEmployeeAction(emp.id)}
                confirmMessage={`Remove staff access for "${emp.full_name}"?`}
              />
            </td>
          </tr>
        ))}
        {employees.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
              No staff accounts yet.
            </td>
          </tr>
        )}
      </AdminTable>

      <form action={formAction} className="bg-cream rounded-2xl p-6 space-y-4 max-w-lg">
        <h3 className="font-heading text-lg text-brown">Add Staff Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="fullName" placeholder="Full Name" required className={inputClasses} />
          <input name="phone" placeholder="Phone Number" className={inputClasses} />
        </div>
        <input name="email" type="email" placeholder="Work Email" required className={inputClasses} />
        <input name="password" type="password" placeholder="Temporary Password" required minLength={6} className={inputClasses} />
        <select name="role" defaultValue="employee" className={inputClasses}>
          <option value="employee">Employee</option>
          <option value="owner">Owner (full access)</option>
        </select>

        {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2">Staff account created!</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose text-white font-semibold px-6 py-3 hover:bg-brown transition-colors disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
