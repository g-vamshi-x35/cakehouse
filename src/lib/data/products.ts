import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  products as staticProducts,
  getProductBySlug as staticGetBySlug,
  getFeaturedProducts as staticGetFeatured,
  getSimilarProducts as staticGetSimilar,
  type Product,
  type WeightOption,
} from "@/data/products";

// Design type / theme / min-recommended weight / cream type / availability
// are curated presentation content, not yet columns in the products table —
// enrich DB-sourced rows with them by slug so they show up on the live
// (Supabase-backed) site too, not just the static fallback.
//
// Images specifically: a DB row that already existed before a photo was
// added only has the photo in product_images once the corresponding SQL
// migration is run there. Until then, this row's `images` from the DB is
// `[]`, which would show the "Image Coming Soon" placeholder even though a
// real local file exists in the static catalog. Falling back to the static
// image whenever the DB has none means the real photo shows immediately,
// without waiting on that migration.
function enrichFromStatic(product: Product): Product {
  const staticMatch = staticGetBySlug(product.slug);
  if (!staticMatch) {
    console.log(`[images] "${product.slug}": no static entry to fall back to (using DB images as-is: ${JSON.stringify(product.images)})`);
    return product;
  }

  const weightOptions: WeightOption[] | undefined = product.weightOptions?.map((w) => {
    const staticOption = staticMatch.weightOptions?.find((sw) => sw.label === w.label);
    return staticOption?.compareAtPrice ? { ...w, compareAtPrice: staticOption.compareAtPrice } : w;
  });

  let images = product.images;
  if (images.length === 0 && staticMatch.images.length > 0) {
    console.log(`[images] "${product.slug}": DB had no images, falling back to static -> ${JSON.stringify(staticMatch.images)}`);
    images = staticMatch.images;
  } else if (images.length > 0) {
    console.log(`[images] "${product.slug}": using DB image(s) -> ${JSON.stringify(images)}`);
  } else {
    console.log(`[images] "${product.slug}": no DB images and no static image found (path attempted: /images/products/cakes/${product.slug}/1.jpg) -> showing placeholder`);
  }

  return {
    ...product,
    images,
    weightOptions: weightOptions ?? product.weightOptions,
    available: staticMatch.available,
    tags: staticMatch.tags,
    designType: staticMatch.designType,
    theme: staticMatch.theme,
    minWeight: staticMatch.minWeight,
    recommendedWeight: staticMatch.recommendedWeight,
    creamType: staticMatch.creamType,
  };
}

const CAKE_CATEGORIES = new Set(["regular-cakes", "customized-cakes"]);

type DbProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  price_500: number | null;
  price_1000: number | null;
  base_price: number | null;
  note: string | null;
  is_featured: boolean;
  avg_rating: number | null;
  review_count: number | null;
  categories: { slug: string } | { slug: string }[] | null;
  product_images: { url: string; sort_order: number }[] | null;
  product_flavours: { name: string }[] | null;
  product_weight_options: { label: string; price: number | null }[] | null;
};

function mapRow(row: DbProductRow): Product {
  const categorySlug = Array.isArray(row.categories)
    ? row.categories[0]?.slug
    : row.categories?.slug;
  const category = (categorySlug ?? "regular-cakes") as Product["category"];
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);
  const weightOptions: WeightOption[] | undefined = row.product_weight_options?.length
    ? row.product_weight_options.map((w) => ({ label: w.label, price: w.price }))
    : undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: CAKE_CATEGORIES.has(category) ? "cake" : "snack",
    category,
    description: row.description ?? "",
    ingredients: row.ingredients ?? undefined,
    images,
    price: row.price_500 ?? row.base_price ?? 0,
    weightOptions,
    flavours: row.product_flavours?.map((f) => f.name),
    note: row.note ?? undefined,
    featured: row.is_featured,
    avgRating: row.avg_rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
  };
}

const SELECT = `
  id, slug, name, description, ingredients, price_500, price_1000, base_price, note, is_featured, avg_rating, review_count,
  categories ( slug ),
  product_images ( url, sort_order ),
  product_flavours ( name ),
  product_weight_options ( label, price )
`;

export async function getAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticProducts;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("is_active", true);

  if (error || !data) return staticProducts;
  return (data as unknown as DbProductRow[]).map(mapRow).map(enrichFromStatic);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) return staticGetBySlug(slug);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return staticGetBySlug(slug);
  return enrichFromStatic(mapRow(data as unknown as DbProductRow));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticGetFeatured();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("is_active", true)
    .eq("is_featured", true);

  if (error || !data) return staticGetFeatured();
  return (data as unknown as DbProductRow[]).map(mapRow).map(enrichFromStatic);
}

export async function getSimilarProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticGetSimilar(product, limit);

  const supabase = await createClient();
  // Filtering on an embedded (left-joined) relation's column is silently
  // unreliable in PostgREST unless the embed is forced to an inner join —
  // without `!inner` here, categories.slug was never actually applied,
  // so "similar" products included every category (e.g. pizza next to cakes).
  const { data, error } = await supabase
    .from("products")
    .select(SELECT.replace("categories (", "categories!inner ("))
    .eq("is_active", true)
    .eq("categories.slug", product.category)
    .neq("id", product.id)
    .limit(limit);

  if (error || !data) return staticGetSimilar(product, limit);
  return (data as unknown as DbProductRow[]).map(mapRow).map(enrichFromStatic);
}
