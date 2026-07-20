import { AdminPageHeader } from "@/components/admin/AdminUI";
import MessageList from "@/components/admin/MessageList";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, is_read, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader title="Contact Messages" description="Messages submitted through the website" />
      <MessageList messages={messages ?? []} />
    </div>
  );
}
