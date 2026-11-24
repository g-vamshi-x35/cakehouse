import { PREMIUM_FALLBACK } from './site-data';
import { supabase } from './supabase';

export type PremiumCake = {
  id: string | null;
  slug: string;
  name: string;
  images: string[];
  price: number | null;
  priceLabel: string | null;
};

/** Same rule as the website's premium-price.ts: "₹1,200 per kg", or null when not priced yet. */
export function formatPremiumPrice(price: number | null, label: string | null) {
  if (price == null) return null;
  return `₹${price.toLocaleString('en-IN')}${label ? ` ${label}` : ''}`;
}

/** Website's hand-picked showpieces (src/components/sections/SignatureCakes.tsx). */
export const SIGNATURE_SLUGS = ['ferrero-rocher-cake', 'red-velvet-cake', 'kitkat-cake', 'mango-cake', 'oreo-cake', 'white-forest-cake'];

let cache: { at: number; list: PremiumCake[] } | null = null;

/**
 * Premium Cakes from the `premium_cakes` table (prices are set by the owner
 * in the website dashboard). Falls back to the website's photo list with
 * "Price on request" when the database can't be reached — like the website.
 */
export async function fetchPremiumCakes(fresh = false): Promise<PremiumCake[]> {
  if (!fresh && cache && Date.now() - cache.at < 2 * 60 * 1000) return cache.list;
  const fallback = PREMIUM_FALLBACK.map((c) => ({ ...c, id: null, price: null, priceLabel: null }));
  const { data, error } = await supabase
    .from('premium_cakes')
    .select('id, slug, name, images, price, price_label, sort_order')
    .eq('is_active', true)
    .order('sort_order');
  if (error || !data?.length) return fallback;
  type Row = { id: string; slug: string; name: string; images: string[] | null; price: number | string | null; price_label: string | null };
  const list = (data as Row[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    images: r.images?.length ? r.images : (PREMIUM_FALLBACK.find((c) => c.slug === r.slug)?.images ?? []),
    price: r.price == null ? null : Number(r.price),
    priceLabel: r.price_label,
  }));
  cache = { at: Date.now(), list };
  return list;
}
