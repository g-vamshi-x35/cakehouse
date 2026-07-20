import Image from "next/image";
import SectionReveal from "@/components/ui/SectionReveal";
import { business } from "@/data/business";

export default function AboutStory() {
  return (
    <section className="bg-cream-light py-20 md:py-28">
      <div className="container-px grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <SectionReveal delay={0.05} className="order-2 lg:order-1">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            Who We Are
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown leading-tight mb-6">
            A Family Bakery Built On Trust
          </h2>
          <div className="space-y-4 text-ink/75 leading-relaxed max-w-lg">
            <p>
              {business.subBrand} is the home behind {business.name} — a
              neighbourhood bakery where every cake is made to order, by hand,
              using 100% vegetarian and 100% egg-free ingredients.
            </p>
            <p>
              We specialise in fully customized celebration cakes — doll
              cakes, car cakes, cartoon cakes, wedding tiers and more —
              alongside our everyday menu of classic flavours, pizzas and
              snacks. No two orders are ever quite the same, because each one
              is designed around the celebration it&apos;s for.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal y={30} className="order-1 lg:order-2">
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] max-w-md mx-auto shadow-xl">
            <Image
              src="/images/about/about-rose-flower-cake.jpg"
              alt="An elegant rose-decorated tiered cake handcrafted at Cake House"
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
