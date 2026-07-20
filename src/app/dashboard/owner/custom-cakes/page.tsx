import { AdminPageHeader } from "@/components/admin/AdminUI";
import CustomCakeRequestCard from "@/components/admin/CustomCakeRequestCard";
import { createClient } from "@/lib/supabase/server";

export default async function CustomCakeRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("custom_cake_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader title="Custom Cake Requests" description="Review, quote and approve customer requests" />
      <div className="space-y-4">
        {(requests ?? []).map((r) => (
          <CustomCakeRequestCard key={r.id} request={r} />
        ))}
        {(!requests || requests.length === 0) && (
          <p className="text-sm text-ink/50 bg-cream rounded-2xl p-8 text-center">
            No custom cake requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
