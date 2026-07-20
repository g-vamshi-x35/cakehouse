import Link from "next/link";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProductAction } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price_500, base_price, is_active, is_featured, categories ( name )")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your menu"
        action={
          <Link
            href="/dashboard/owner/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-rose text-white text-sm font-semibold px-5 py-2.5 hover:bg-brown transition-colors"
          >
            <FiPlus /> Add Product
          </Link>
        }
      />

      <AdminTable columns={["Name", "Category", "Price", "Status", "Featured", ""]}>
        {(products ?? []).map((p) => {
          const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
          return (
            <tr key={p.id}>
              <td className="px-4 py-3 font-semibold text-ink">{p.name}</td>
              <td className="px-4 py-3 text-ink/60">{category?.name ?? "—"}</td>
              <td className="px-4 py-3">₹{p.price_500 ?? p.base_price ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.is_active ? "Active" : "Hidden"}
                </span>
              </td>
              <td className="px-4 py-3">{p.is_featured ? "⭐" : ""}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/owner/products/${p.id}/edit`} className="text-brown/50 hover:text-rose transition-colors">
                    <FiEdit2 size={15} />
                  </Link>
                  <DeleteButton
                    action={() => deleteProductAction(p.id)}
                    confirmMessage={`Delete "${p.name}"? This cannot be undone.`}
                  />
                </div>
              </td>
            </tr>
          );
        })}
        {(!products || products.length === 0) && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
              No products yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
