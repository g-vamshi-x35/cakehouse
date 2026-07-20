import { AdminPageHeader } from "@/components/admin/AdminUI";
import BannerManager from "@/components/admin/BannerManager";
import SiteAnnouncementForm from "@/components/admin/SiteAnnouncementForm";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: banners }, { data: setting }] = await Promise.all([
    supabase.from("banners").select("id, title, subtitle, image_url, is_active").order("sort_order"),
    supabase.from("site_settings").select("value").eq("key", "announcement").maybeSingle(),
  ]);

  const announcementValue = (setting?.value as { text?: string } | null)?.text ?? "";

  return (
    <div className="space-y-8">
      <div>
        <AdminPageHeader title="Website Settings" description="Banners & site-wide messages" />
        <SiteAnnouncementForm initialValue={announcementValue} />
      </div>
      <div>
        <h2 className="font-heading text-lg text-brown mb-4">Homepage Banners</h2>
        <BannerManager banners={banners ?? []} />
      </div>
    </div>
  );
}
