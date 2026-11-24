import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PREMIUM_CAKES } from "@/data/premium";

export type PremiumCakeItem = {
  id: string | null;
  slug: string;
  name: string;
  images: string[];
  price: number | null;
  priceLabel: string | null;
};

type Row = {
  id: string;
  slug: string;
  name: string;
  images: string[] | null;
  price: number | string | null;
  price_label: string | null;
  sort_order: number;
};

/**
 * Premium Cakes for the public page. Prices come only from the database
 * (set by the owner); if the database can't be reached, the photo list from
 * src/data/premium.ts is shown with "Price on request".
 */
export async function getPremiumCakes(): Promise<PremiumCakeItem[]> {
  const fallback = PREMIUM_CAKES.map((c) => ({ ...c, id: null, price: null, priceLabel: null }));
  if (!isSupabaseConfigured()) return fallback;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("premium_cakes")
    .select("id, slug, name, images, price, price_label, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data || data.length === 0) return fallback;
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    images: r.images?.length ? r.images : (PREMIUM_CAKES.find((c) => c.slug === r.slug)?.images ?? []),
    price: r.price == null ? null : Number(r.price),
    priceLabel: r.price_label,
  }));
}
