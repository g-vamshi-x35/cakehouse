import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import ProductCell, { productThumbUrl, type ProductImage } from "@/components/admin/ProductCell";
import { createClient } from "@/lib/supabase/server";

// Employees can look up any product (photo, SKU, price) while taking orders;
// adding or editing products stays with the owner.
export default async function EmployeeProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, sku, price_500, price_1000, base_price, is_active, categories ( name ), product_images ( url, sort_order )")
    .order("name");

  return (
    <div>
      <AdminPageHeader title="Products" description="Every item on the menu, with its SKU and price" />

      <AdminTable columns={["Product", "Category", "Price", "Status"]}>
        {(products ?? []).map((p) => {
          const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
          const price =
            p.price_500 != null
              ? `₹${p.price_500} / 0.5 kg${p.price_1000 != null ? ` · ₹${p.price_1000} / 1 kg` : ""}`
              : p.base_price != null
                ? `₹${p.base_price}`
                : "—";
          return (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <ProductCell name={p.name} sku={p.sku} imageUrl={productThumbUrl(p.slug, p.product_images as unknown as ProductImage[])} />
              </td>
              <td className="px-4 py-3 text-ink/60">{category?.name ?? "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap">{price}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.is_active ? "Active" : "Hidden"}
                </span>
              </td>
            </tr>
          );
        })}
        {(!products || products.length === 0) && (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
              No products yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
