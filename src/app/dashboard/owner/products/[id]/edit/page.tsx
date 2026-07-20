import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import ProductForm from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase
      .from("products")
      .select("id, name, slug, category_id, description, ingredients, price_500, price_1000, base_price, is_featured, is_active")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title="Edit Product" />
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  );
}
