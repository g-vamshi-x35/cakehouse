import { AdminPageHeader } from "@/components/admin/AdminUI";
import CouponManager from "@/components/admin/CouponManager";
import { createClient } from "@/lib/supabase/server";

export default async function CouponsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("id, code, discount_type, discount_value, min_order_amount, used_count, max_uses, active")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader title="Coupons" description="Create and manage discount codes" />
      <CouponManager coupons={coupons ?? []} />
    </div>
  );
}
