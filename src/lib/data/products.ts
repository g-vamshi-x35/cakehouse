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
  return (data as unknown as DbProductRow[]).map(mapRow);
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
  return mapRow(data as unknown as DbProductRow);
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
  return (data as unknown as DbProductRow[]).map(mapRow);
}

export async function getSimilarProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticGetSimilar(product, limit);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("is_active", true)
    .eq("categories.slug", product.category)
    .neq("id", product.id)
    .limit(limit);

  if (error || !data) return staticGetSimilar(product, limit);
  return (data as unknown as DbProductRow[]).map(mapRow);
}
