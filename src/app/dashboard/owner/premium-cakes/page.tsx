import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import ProductCell from "@/components/admin/ProductCell";
import PremiumPriceForm from "@/components/admin/PremiumPriceForm";
import { createClient } from "@/lib/supabase/server";

export default async function OwnerPremiumCakesPage() {
  const supabase = await createClient();
  const { data: cakes, error } = await supabase
    .from("premium_cakes")
    .select("id, slug, name, images, price, price_label, is_active")
    .order("sort_order");

  const priced = (cakes ?? []).filter((c) => c.price != null).length;

  return (
    <div>
      <AdminPageHeader
        title="Premium Cakes"
        description={`Set the price shown on the Premium Cakes page. Leave it empty to show “Price on request”. ${priced} of ${cakes?.length ?? 0} priced.`}
        action={
          <Link
            href="/premium-cakes"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brown text-brown text-sm font-semibold px-5 py-2 hover:bg-brown hover:text-cream-light transition-colors"
          >
            View page
          </Link>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          Couldn&apos;t load premium cakes: {error.message}. Run migration 0026_premium_cakes.sql.
        </p>
      )}

      <div className="bg-cream rounded-2xl divide-y divide-brown/10">
        {(cakes ?? []).map((c) => (
          <div key={c.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4">
            <div className="lg:w-72 shrink-0">
              <ProductCell name={c.name} sku={`${c.images.length} photo${c.images.length === 1 ? "" : "s"}`} imageUrl={c.images[0] ?? null} />
            </div>
            <PremiumPriceForm id={c.id} price={c.price == null ? null : Number(c.price)} priceLabel={c.price_label} isActive={c.is_active} />
          </div>
        ))}
      </div>
    </div>
  );
}
