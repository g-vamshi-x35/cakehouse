import { AdminPageHeader } from "@/components/admin/AdminUI";
import ProductForm from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <div>
      <AdminPageHeader title="Add Product" />
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
