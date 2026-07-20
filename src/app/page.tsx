import Hero from "@/components/sections/Hero";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import FeaturedMenu from "@/components/sections/FeaturedMenu";
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
      <AboutTeaser />
      <CTABand />
    </>
  );
}
