import WishlistGrid from "@/components/account/WishlistGrid";
import { createClient } from "@/lib/supabase/server";

type WishlistRow = {
  product_id: string;
  products: {
    id: string;
    slug: string;
    name: string;
    price_500: number | null;
    base_price: number | null;
    product_images: { url: string; sort_order: number }[] | null;
  } | null;
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("wishlists")
    .select("product_id, products ( id, slug, name, price_500, base_price, product_images ( url, sort_order ) )")
    .eq("customer_id", user!.id);

  const products = ((data as unknown as WishlistRow[]) ?? [])
    .map((row) => row.products)
    .filter((p): p is NonNullable<WishlistRow["products"]> => Boolean(p))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price_500 ?? p.base_price,
      image: p.product_images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null,
    }));

  return <WishlistGrid products={products} />;
}
