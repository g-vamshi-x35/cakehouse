import ProfileForm from "@/components/account/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, birthday")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <ProfileForm
      email={user?.email ?? ""}
      fullName={profile?.full_name ?? ""}
      phone={profile?.phone ?? ""}
      birthday={profile?.birthday ?? ""}
    />
  );
}
