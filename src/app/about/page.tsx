import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import AboutStory from "@/components/sections/AboutStory";
import ValuesGrid from "@/components/sections/ValuesGrid";
import Gallery from "@/components/sections/Gallery";
import CTABand from "@/components/sections/CTABand";

export const metadata: Metadata = {
  title: "About Us | Cake House",
  description:
    "Meet Cake House — Sri Marlapolama Bakery. A family-run, 100% vegetarian & egg-free bakery handcrafting custom cakes with care.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Baked With Heart, Since Day One"
        subtitle="Every cake that leaves our kitchen carries the same promise: fresh ingredients, honest craft, and great taste in every bite."
      />
      <AboutStory />
      <ValuesGrid />
      <Gallery />
      <CTABand />
    </>
  );
}
