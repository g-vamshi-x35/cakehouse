import { AdminPageHeader } from "@/components/admin/AdminUI";
import InventoryManager from "@/components/admin/InventoryManager";
import { createClient } from "@/lib/supabase/server";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("inventory_items")
    .select("id, name, unit, quantity, low_stock_threshold")
    .order("name");

  return (
    <div>
      <AdminPageHeader title="Inventory" description="Track ingredient & supply stock" />
      <InventoryManager items={items ?? []} canDelete />
    </div>
  );
}
