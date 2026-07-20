import { AdminPageHeader } from "@/components/admin/AdminUI";
import NotificationList from "@/components/account/NotificationList";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, is_read, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader title="Notifications" />
      <NotificationList notifications={notifications ?? []} />
    </div>
  );
}
