import { supabase } from './supabase';

export type WeightOption = { label: string; price: number };
export type Product = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  isCake: boolean;
  price: number;
  weights: WeightOption[];
  flavours: string[];
  note: string | null;
  isActive: boolean;
  image: string | null;
};

export const CATEGORIES = [
  { slug: 'all', name: 'All' },
  { slug: 'regular-cakes', name: 'Cakes' },
  { slug: 'customized-cakes', name: 'Customized' },
  { slug: 'pizza', name: 'Pizza' },
  { slug: 'snacks', name: 'Samosa & Patties' },
];

const SELECT = `
  id, slug, sku, name, description, price_500, base_price, note, is_active,
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
  price_500: number | null;
  base_price: number | null;
  note: string | null;
  is_active: boolean;
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
  const image = (r.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
  const categorySlug = cat?.slug ?? 'regular-cakes';
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    description: r.description ?? '',
    categorySlug,
    categoryName: cat?.name ?? '',
    isCake: categorySlug === 'regular-cakes' || categorySlug === 'customized-cakes',
    price: Number(weights[0]?.price ?? r.price_500 ?? r.base_price ?? 0),
    weights,
    flavours: (r.product_flavours ?? []).map((f) => f.name),
    note: r.note,
    isActive: r.is_active,
    image,
  };
}

/** Menu items customers can order (staff also see hidden ones when includeHidden). */
export async function fetchProducts(includeHidden = false): Promise<Product[]> {
  let q = supabase.from('products').select(SELECT).order('name');
  if (!includeHidden) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  const order = CATEGORIES.map((c) => c.slug);
  // Cakes first, then customized cakes, pizza, snacks (name order within each).
  return (data as unknown as Row[])
    .map(mapRow)
    .sort((a, b) => rank(a.categorySlug) - rank(b.categorySlug) || a.name.localeCompare(b.name));

  function rank(slug: string) {
    const i = order.indexOf(slug);
    return i === -1 ? order.length : i; // unknown categories go last
  }
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as unknown as Row) : null;
}
