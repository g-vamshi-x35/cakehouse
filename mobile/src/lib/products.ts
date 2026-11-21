import { supabase } from './supabase';

export type WeightOption = { label: string; price: number };
export type Product = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  description: string;
  ingredients: string | null;
  categorySlug: string;
  categoryName: string;
  isCake: boolean;
  /** Theme / design cakes are quoted, not bought directly (same as the website). */
  isCustomCake: boolean;
  price: number;
  weights: WeightOption[];
  flavours: string[];
  note: string | null;
  isActive: boolean;
  isFeatured: boolean;
  avgRating: number;
  reviewCount: number;
  image: string | null;
  images: string[];
};

export type Category = { slug: string; name: string };

/** Tab order on the menu — matches the website's category order. */
export const CATEGORIES: Category[] = [
  { slug: 'all', name: 'All' },
  { slug: 'regular-cakes', name: 'Cakes' },
  { slug: 'customized-cakes', name: 'Customized' },
  { slug: 'pizza', name: 'Pizza' },
  { slug: 'snacks', name: 'Samosa & Patties' },
];

const SELECT = `
  id, slug, sku, name, description, ingredients, price_500, base_price, note, is_active, is_featured,
  avg_rating, review_count,
  categories ( slug, name ),
  product_images ( url, sort_order ),
  product_flavours ( name ),
  product_weight_options ( label, price )
`;

type Row = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  description: string | null;
  ingredients: string | null;
  price_500: number | null;
  base_price: number | null;
  note: string | null;
  is_active: boolean;
  is_featured: boolean;
  avg_rating: number | null;
  review_count: number | null;
  categories: { slug: string; name: string } | { slug: string; name: string }[] | null;
  product_images: { url: string; sort_order: number }[] | null;
  product_flavours: { name: string }[] | null;
  product_weight_options: { label: string; price: number }[] | null;
};

function mapRow(r: Row): Product {
  const cat = Array.isArray(r.categories) ? r.categories[0] : r.categories;
  const weights = (r.product_weight_options ?? [])
    .map((w) => ({ label: w.label, price: Number(w.price) }))
    .sort((a, b) => a.price - b.price);
  const images = (r.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);
  const categorySlug = cat?.slug ?? 'regular-cakes';
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    description: r.description ?? '',
    ingredients: r.ingredients,
    categorySlug,
    categoryName: cat?.name ?? '',
    isCake: categorySlug === 'regular-cakes' || categorySlug === 'customized-cakes',
    isCustomCake: categorySlug === 'customized-cakes',
    price: Number(weights[0]?.price ?? r.price_500 ?? r.base_price ?? 0),
    weights,
    flavours: (r.product_flavours ?? []).map((f) => f.name),
    note: r.note,
    isActive: r.is_active,
    isFeatured: r.is_featured,
    avgRating: Number(r.avg_rating ?? 0),
    reviewCount: Number(r.review_count ?? 0),
    image: images[0] ?? null,
    images,
  };
}

function rank(slug: string) {
  const i = CATEGORIES.findIndex((c) => c.slug === slug);
  return i === -1 ? CATEGORIES.length : i;
}

// Small in-memory cache so switching tabs doesn't refetch the whole menu.
let cache: { at: number; list: Product[] } | null = null;
const CACHE_MS = 2 * 60 * 1000;

/** Menu items customers can order (staff also see hidden ones when includeHidden). */
export async function fetchProducts(opts: { includeHidden?: boolean; fresh?: boolean } = {}): Promise<Product[]> {
  if (!opts.includeHidden && !opts.fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.list;
  let q = supabase.from('products').select(SELECT).order('name');
  if (!opts.includeHidden) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  const list = (data as unknown as Row[])
    .map(mapRow)
    .sort((a, b) => rank(a.categorySlug) - rank(b.categorySlug) || a.name.localeCompare(b.name));
  if (!opts.includeHidden) cache = { at: Date.now(), list };
  return list;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const cached = cache?.list.find((p) => p.id === id);
  if (cached) return cached;
  const { data, error } = await supabase.from('products').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as unknown as Row) : null;
}

export function priceText(p: Product) {
  if (p.weights.length > 1) return `From ₹${p.weights[0].price}`;
  if (p.price > 0) return `₹${p.price}`;
  return 'Price on request';
}

export type Banner = { id: string; title: string | null; subtitle: string | null; image_url: string | null; link_url: string | null };

export async function fetchBanners(): Promise<Banner[]> {
  const { data } = await supabase
    .from('banners')
    .select('id, title, subtitle, image_url, link_url')
    .eq('is_active', true)
    .order('sort_order');
  return (data as Banner[] | null) ?? [];
}

export type Coupon = {
  id: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  min_order_amount: number;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
};

export async function fetchCoupons(): Promise<Coupon[]> {
  const { data } = await supabase
    .from('coupons')
    .select('id, code, discount_type, discount_value, min_order_amount, expires_at, max_uses, used_count')
    .eq('active', true);
  const now = Date.now();
  return ((data as Coupon[] | null) ?? []).filter(
    (c) => (!c.expires_at || new Date(c.expires_at).getTime() > now) && (c.max_uses == null || c.used_count < c.max_uses)
  );
}

/** Same rules the database applies in place_cart_order — used for the preview only. */
export function couponDiscount(c: Coupon, subtotal: number) {
  if (subtotal < Number(c.min_order_amount)) return 0;
  const v = c.discount_type === 'percent' ? Math.round((subtotal * Number(c.discount_value)) / 100) : Number(c.discount_value);
  return Math.min(subtotal, v);
}

export function couponLabel(c: Coupon) {
  return c.discount_type === 'percent' ? `${Number(c.discount_value)}% OFF` : `₹${Number(c.discount_value)} OFF`;
}

export type Review = { id: string; rating: number; comment: string | null; author: string; productName: string | null };

export async function fetchFeaturedReviews(limit = 6): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, comment, guest_name, products ( name )')
    .gte('rating', 4)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  type R = { id: string; rating: number; comment: string | null; guest_name: string | null; products: { name: string } | { name: string }[] | null };
  return ((data as unknown as R[] | null) ?? []).map((r) => {
    const p = Array.isArray(r.products) ? r.products[0] : r.products;
    return { id: r.id, rating: r.rating, comment: r.comment, author: r.guest_name || 'Cake House Customer', productName: p?.name ?? null };
  });
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, comment, guest_name')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(20);
  type R = { id: string; rating: number; comment: string | null; guest_name: string | null };
  return ((data as R[] | null) ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    author: r.guest_name || 'Cake House Customer',
    productName: null,
  }));
}
