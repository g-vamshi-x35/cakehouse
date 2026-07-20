import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import { createClient } from "@/lib/supabase/server";

export default async function ActivityLogPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_log")
    .select("id, action, entity_type, entity_id, created_at, profiles ( full_name )")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <AdminPageHeader title="Activity Log" description="Recent staff actions" />
      <AdminTable columns={["Action", "By", "Entity", "When"]}>
        {(logs ?? []).map((log) => {
          const actor = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
          return (
            <tr key={log.id}>
              <td className="px-4 py-3 font-semibold text-ink">{log.action}</td>
              <td className="px-4 py-3 text-ink/60">{actor?.full_name || "System"}</td>
              <td className="px-4 py-3 text-xs text-ink/40">
                {log.entity_type ? `${log.entity_type} · ${log.entity_id?.slice(0, 8)}` : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-ink/50">
                {new Date(log.created_at).toLocaleString("en-IN")}
              </td>
            </tr>
          );
        })}
        {(!logs || logs.length === 0) && (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
              No activity recorded yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
