import { AdminPageHeader } from "@/components/admin/AdminUI";
import CategoryManager from "@/components/admin/CategoryManager";
import { createClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("sort_order");

  return (
    <div>
      <AdminPageHeader title="Categories" description="Organize your menu" />
      <CategoryManager categories={categories ?? []} />
    </div>
  );
}
