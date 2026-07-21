import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";
import ProductGallery from "@/components/product/ProductGallery";
import ProductOrderPanel from "@/components/product/ProductOrderPanel";
import SimilarProducts from "@/components/product/SimilarProducts";
import ProductReviews from "@/components/product/ProductReviews";
import SectionReveal from "@/components/ui/SectionReveal";
import StarRating from "@/components/ui/StarRating";
import WishlistButton from "@/components/product/WishlistButton";
import { getProductBySlug, getSimilarProducts } from "@/lib/data/products";
import { SHELF_LIFE, STORAGE_INSTRUCTIONS, servingSizeFor } from "@/data/products";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found | Cake House" };
  return {
    title: `${product.name} | Cake House`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const similar = await getSimilarProducts(product);
  const placeholderEmoji =
    product.category === "pizza" ? "🍕" : product.category === "snacks" ? "🥟" : "🎂";

  let isLoggedIn = false;
  let isWishlisted = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
    if (user) {
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("customer_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();
      isWishlisted = Boolean(data);
    }
  }

  return (
    <>
      <div className="bg-brown pt-28 pb-4 md:pt-32">
        <nav className="container-px flex items-center gap-1.5 text-xs text-cream-light/70">
          <Link href="/" className="hover:text-cream">Home</Link>
          <FiChevronRight size={12} />
          <Link href="/menu" className="hover:text-cream">Menu</Link>
          <FiChevronRight size={12} />
          <span className="text-cream">{product.name}</span>
        </nav>
      </div>

      <section className="bg-brown pb-14 md:pb-20">
        <div className="container-px grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <SectionReveal y={20}>
            <ProductGallery images={product.images} name={product.name} placeholderEmoji={placeholderEmoji} />
          </SectionReveal>

          <SectionReveal delay={0.08} y={20}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-heading text-3xl md:text-4xl text-cream">{product.name}</h1>
              <WishlistButton
                productId={product.id}
                productSlug={product.slug}
                initialWishlisted={isWishlisted}
                isLoggedIn={isLoggedIn}
              />
            </div>
            {Boolean(product.reviewCount) && (
              <div className="flex items-center gap-2 mb-3 text-sm text-cream-light/80">
                <StarRating rating={product.avgRating ?? 0} size={14} />
                <span>
                  {product.avgRating?.toFixed(1)} ({product.reviewCount} review
                  {product.reviewCount !== 1 ? "s" : ""})
                </span>
              </div>
            )}
            <p className="text-cream-light/80 leading-relaxed mb-6">{product.description}</p>
            <ProductOrderPanel product={product} />
          </SectionReveal>
        </div>
      </section>

      {product.ingredients && (
        <section className="bg-cream py-12 md:py-16">
          <div className="container-px max-w-3xl mx-auto">
            <SectionReveal>
              <h2 className="font-heading text-2xl text-brown mb-3">Ingredients</h2>
              <p className="text-ink/70 leading-relaxed">{product.ingredients}</p>
            </SectionReveal>
          </div>
        </section>
      )}

      {product.category === "regular-cakes" && (
        <section className="bg-cream-light py-12 md:py-16">
          <div className="container-px max-w-3xl mx-auto">
            <SectionReveal>
              <h2 className="font-heading text-2xl text-brown mb-5">Good to Know</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <DetailRow label="Shelf Life" value={SHELF_LIFE} />
                <DetailRow label="Storage Instructions" value={STORAGE_INSTRUCTIONS} />
                {product.weightOptions && (
                  <DetailRow
                    label="Serving Size"
                    value={product.weightOptions
                      .filter((w) => w.price != null)
                      .map((w) => `${w.label} — ${servingSizeFor(w.label)}`)
                      .join(" · ")}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                  ✓ 100% Eggless
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                  ✓ 100% Vegetarian
                </span>
              </div>
            </SectionReveal>
          </div>
        </section>
      )}

      {product.category === "customized-cakes" && (
        <section className="bg-cream-light py-12 md:py-16">
          <div className="container-px max-w-3xl mx-auto">
            <SectionReveal>
              <h2 className="font-heading text-2xl text-brown mb-5">Design Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {product.designType && <DetailRow label="Design Type" value={product.designType} />}
                {product.theme && <DetailRow label="Theme" value={product.theme} />}
                {product.minWeight && <DetailRow label="Minimum Weight" value={product.minWeight} />}
                {product.recommendedWeight && (
                  <DetailRow label="Recommended Weight" value={product.recommendedWeight} />
                )}
                {product.creamType && <DetailRow label="Cream Type" value={product.creamType} />}
                <DetailRow label="Pricing" value="Final price depends on design complexity — message us for a quote." />
              </div>
            </SectionReveal>
          </div>
        </section>
      )}

      <SimilarProducts products={similar} />
      <ProductReviews productId={product.id} productSlug={product.slug} />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink/50 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className="text-ink/80 leading-relaxed">{value}</p>
    </div>
  );
}
