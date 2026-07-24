import Hero from "@/components/sections/Hero";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import FeaturedMenu from "@/components/sections/FeaturedMenu";
import CategoryRail from "@/components/sections/CategoryRail";
import AboutTeaser from "@/components/sections/AboutTeaser";
import CTABand from "@/components/sections/CTABand";
import { getHeroVideoSrc } from "@/lib/media";
import { getAllProducts } from "@/lib/data/products";

export default async function Home() {
  const heroVideoSrc = getHeroVideoSrc();
  // Fetched once and shared below — this used to be 3 separate full-catalog
  // Supabase queries (one per section), which was adding real latency to
  // every homepage load for no reason since they all want the same data.
  const products = await getAllProducts();
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <>
      <Hero videoSrc={heroVideoSrc} />
      <WhyChooseUs />
      <FeaturedMenu products={featuredProducts} />
      <CategoryRail tag="new-arrivals" eyebrow="Just Added" title="New Arrivals" allProducts={products} />
      <CategoryRail tag="designer-cakes" eyebrow="Something Special" title="Designer Cakes" allProducts={products} />
      <AboutTeaser />
      <CTABand />
    </>
  );
}
