import Hero from "@/components/sections/Hero";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import FeaturedMenu from "@/components/sections/FeaturedMenu";
import CategoryRail from "@/components/sections/CategoryRail";
import AboutTeaser from "@/components/sections/AboutTeaser";
import CTABand from "@/components/sections/CTABand";
import { getHeroVideoSrc } from "@/lib/media";

export default function Home() {
  const heroVideoSrc = getHeroVideoSrc();

  return (
    <>
      <Hero videoSrc={heroVideoSrc} />
      <WhyChooseUs />
      <FeaturedMenu />
      <CategoryRail tag="new-arrivals" eyebrow="Just Added" title="New Arrivals" />
      <CategoryRail tag="premium-cakes" eyebrow="Something Special" title="Premium Cakes" />
      <AboutTeaser />
      <CTABand />
    </>
  );
}
