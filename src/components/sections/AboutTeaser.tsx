import Image from "next/image";
import SectionReveal from "@/components/ui/SectionReveal";
import Button from "@/components/ui/Button";
import { business } from "@/data/business";

export default function AboutTeaser() {
  return (
    <section className="bg-cream-light py-20 md:py-28 overflow-hidden">
      <div className="container-px grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <SectionReveal y={30}>
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] max-w-md mx-auto lg:mx-0 shadow-xl">
            <Image
              src="/images/about/about-cherry-blossom-cake.jpg"
              alt="A handcrafted cherry blossom themed doll cake from Cake House"
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            Our Story
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown leading-tight mb-6">
            From Our Kitchen to
            <br className="hidden sm:block" /> Your Celebration
          </h2>
          <p className="text-ink/75 leading-relaxed max-w-lg">
            {business.subBrand} has been baking {business.name}&apos;s cakes with
            warmth and care — every design is handcrafted to order, from
            birthday cakes and doll cakes to full wedding tiers. Nothing is
            store-bought; every layer, flower and detail is made fresh, right
            here.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {business.badges.map((badge) => (
              <span
                key={badge}
                className="text-xs font-semibold uppercase tracking-wide bg-cream text-brown px-4 py-2 rounded-full border border-brown/15"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-9">
            <Button href="/about" variant="outline">
              More About Us
            </Button>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
