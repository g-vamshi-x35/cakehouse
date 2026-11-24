import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SectionReveal from "@/components/ui/SectionReveal";
import type { PremiumCakeItem } from "@/lib/data/premium";
import { formatPremiumPrice } from "@/lib/premium-price";

// Hand-picked showpieces from the premium collection (by slug).
const SIGNATURE = ["ferrero-rocher-cake", "red-velvet-cake", "kitkat-cake", "mango-cake", "oreo-cake", "white-forest-cake"];

export default function SignatureCakes({ cakes }: { cakes: PremiumCakeItem[] }) {
  const picks = SIGNATURE.map((slug) => cakes.find((c) => c.slug === slug)).filter(Boolean) as PremiumCakeItem[];
  if (picks.length === 0) return null;

  return (
    <section className="bg-espresso py-20 md:py-28 overflow-hidden">
      <div className="container-px">
        <SectionReveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-gold font-semibold tracking-[0.4em] uppercase text-xs mb-3">Signature Cakes</p>
            <h2 className="font-heading text-4xl md:text-5xl text-cream leading-tight">
              Our Most <span className="italic text-gold">Loved</span> Creations
            </h2>
          </div>
          <Link href="/premium-cakes" className="inline-flex items-center gap-2 text-cream/80 hover:text-gold font-semibold tracking-wide transition-colors">
            View the premium collection <FiArrowRight />
          </Link>
        </SectionReveal>

        <div className="-mx-4 px-4 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6">
          {picks.map((cake, i) => {
            const price = formatPremiumPrice(cake.price, cake.priceLabel);
            return (
              <SectionReveal key={cake.slug} delay={i * 0.07} y={30} className="snap-start shrink-0 w-[68%] sm:w-[42%] md:w-auto">
                <Link href="/premium-cakes" className="group block">
                  <div className="relative aspect-[3/4] rounded-[1.5rem] overflow-hidden ring-1 ring-gold/20">
                    <Image
                      src={cake.images[0]}
                      alt={cake.name}
                      fill
                      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 68vw"
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 p-4">
                      <h3 className="font-heading text-lg text-cream leading-snug">{cake.name}</h3>
                      {price && <p className="text-gold text-sm font-semibold mt-0.5">{price}</p>}
                    </div>
                  </div>
                </Link>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
