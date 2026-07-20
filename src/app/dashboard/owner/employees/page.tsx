import { AdminPageHeader } from "@/components/admin/AdminUI";
import EmployeeManager from "@/components/admin/EmployeeManager";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .in("role", ["employee", "owner"])
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader title="Employees" description="Manage staff accounts & access" />
      <EmployeeManager employees={employees ?? []} />
    </div>
  );
}
