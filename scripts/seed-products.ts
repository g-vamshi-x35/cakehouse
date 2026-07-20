/**
 * One-time seed: pushes src/data/products.ts into Supabase (categories, products,
 * product_images, product_flavours, product_weight_options).
 *
 * Usage:  npx tsx scripts/seed-products.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { products } from "../src/data/products";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment (.env.local)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const CATEGORIES: { slug: string; name: string; sort_order: number }[] = [
  { slug: "regular-cakes", name: "Regular Cakes", sort_order: 1 },
  { slug: "customized-cakes", name: "Customized Cakes", sort_order: 2 },
  { slug: "pizza", name: "Pizza", sort_order: 3 },
  { slug: "snacks", name: "Samosa & Patties", sort_order: 4 },
];

async function main() {
  console.log("Seeding categories...");
  const { data: categoryRows, error: catError } = await supabase
    .from("categories")
    .upsert(CATEGORIES, { onConflict: "slug" })
    .select("id, slug");
  if (catError) throw catError;

  const categoryIdBySlug = new Map(categoryRows!.map((c) => [c.slug, c.id]));

  for (const product of products) {
    console.log(`Seeding product: ${product.name}`);
    const { data: productRow, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          slug: product.slug,
          name: product.name,
          category_id: categoryIdBySlug.get(product.category),
          description: product.description,
          ingredients: product.ingredients ?? null,
          price_500: product.weightOptions?.[0]?.price ?? null,
          price_1000: product.weightOptions?.[1]?.price ?? null,
          base_price: product.price,
          note: product.note ?? null,
          is_customizable: product.category === "customized-cakes",
          is_featured: Boolean(product.featured),
          is_active: true,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (productError) throw productError;
    const productId = productRow.id;

    await supabase.from("product_images").delete().eq("product_id", productId);
    if (product.images.length > 0) {
      await supabase.from("product_images").insert(
        product.images.map((url, i) => ({ product_id: productId, url, sort_order: i }))
      );
    }

    await supabase.from("product_flavours").delete().eq("product_id", productId);
    if (product.flavours && product.flavours.length > 0) {
      await supabase.from("product_flavours").insert(
        product.flavours.map((name) => ({ product_id: productId, name }))
      );
    }

    await supabase.from("product_weight_options").delete().eq("product_id", productId);
    if (product.weightOptions && product.weightOptions.length > 0) {
      await supabase.from("product_weight_options").insert(
        product.weightOptions
          .filter((w) => w.price != null)
          .map((w) => ({ product_id: productId, label: w.label, price: w.price }))
      );
    }
  }

  console.log(`Done. Seeded ${products.length} products across ${CATEGORIES.length} categories.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
