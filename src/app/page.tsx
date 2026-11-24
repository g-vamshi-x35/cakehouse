import Hero from "@/components/sections/Hero";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import FeaturedMenu from "@/components/sections/FeaturedMenu";
import CategoryRail from "@/components/sections/CategoryRail";
import AboutTeaser from "@/components/sections/AboutTeaser";
import CTABand from "@/components/sections/CTABand";
import SignatureCakes from "@/components/sections/SignatureCakes";
import PremiumCollections from "@/components/sections/PremiumCollections";
import CraftShowcase from "@/components/sections/CraftShowcase";
import PizzaPromo from "@/components/sections/PizzaPromo";
import { getAllProducts } from "@/lib/data/products";
import { getPremiumCakes } from "@/lib/data/premium";

export default async function Home() {
  // Fetched once and shared below — this used to be 3 separate full-catalog
  // Supabase queries (one per section), which was adding real latency to
  // every homepage load for no reason since they all want the same data.
  const [products, premiumCakes] = await Promise.all([getAllProducts(), getPremiumCakes()]);
  const featuredProducts = products.filter((p) => p.featured);
  const pizzaPrices = products.filter((p) => p.category === "pizza").map((p) => p.price).filter((n) => n > 0);
  const pizzaFrom = pizzaPrices.length ? Math.min(...pizzaPrices) : null;

  return (
    <>
      <Hero />
      <WhyChooseUs />
      <SignatureCakes cakes={premiumCakes} />
      <PremiumCollections />
      <FeaturedMenu products={featuredProducts} />
      <CraftShowcase />
      <CategoryRail tag="new-arrivals" eyebrow="Just Added" title="New Arrivals" allProducts={products} />
      <PizzaPromo fromPrice={pizzaFrom} />
      <CategoryRail tag="designer-cakes" eyebrow="Something Special" title="Designer Cakes" allProducts={products} />
      <AboutTeaser />
      <CTABand />
    </>
  );
}
