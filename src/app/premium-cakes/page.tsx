import type { Metadata } from "next";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import PremiumCakeCard from "@/components/premium/PremiumCakeCard";
import SectionReveal from "@/components/ui/SectionReveal";
import { getPremiumCakes } from "@/lib/data/premium";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { business } from "@/data/business";

export const metadata: Metadata = {
  title: "Premium Cakes | Cake House",
  description:
    "Our premium cake collection — signature chocolate, fruit, theme and celebration cakes, handcrafted fresh and 100% eggless in Berhampur.",
};

export default async function PremiumCakesPage() {
  const cakes = await getPremiumCakes();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-espresso pt-36 pb-20 md:pt-48 md:pb-28">
        <Image
          src="/images/stylish/chocolate-brownies.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45 -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-espresso/70 via-espresso/55 to-espresso" />
        <div className="container-px text-center max-w-3xl mx-auto">
          <p className="text-gold font-semibold tracking-[0.4em] uppercase text-xs mb-4">The Premium Collection</p>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl text-cream leading-[1.05]">
            Cakes Worth <span className="italic text-gold">Celebrating</span>
          </h1>
          <div className="mx-auto my-6 h-px w-24 bg-gold/60" />
          <p className="text-cream-light/80 leading-relaxed max-w-xl mx-auto">
            {cakes.length} handcrafted signature cakes — rich chocolate, fresh fruit, playful themes and elegant
            celebration designs. 100% eggless, baked fresh to order.
          </p>
        </div>
      </section>

      <section className="bg-[#f7eedb] py-16 md:py-24">
        <div className="container-px">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {cakes.map((cake, i) => (
              <SectionReveal key={cake.slug} delay={Math.min(i % 4, 3) * 0.06} y={30}>
                <PremiumCakeCard cake={cake} priority={i < 4} />
              </SectionReveal>
            ))}
          </div>

          <div className="mt-16 rounded-[2rem] bg-espresso text-cream p-8 md:p-12 text-center max-w-3xl mx-auto">
            <p className="text-gold tracking-[0.35em] uppercase text-xs font-semibold mb-3">Made For Your Moment</p>
            <h2 className="font-heading text-3xl md:text-4xl mb-4">Want a size, flavour or design you don&apos;t see?</h2>
            <p className="text-cream-light/75 mb-7">
              Every premium cake can be made in your choice of weight and flavour. Message us and we&apos;ll craft it for you.
            </p>
            <a
              href={buildWhatsAppLink(`Hi ${business.name}! I'd like to order a premium cake. Can you help me choose?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold text-espresso px-8 py-4 font-semibold tracking-wide hover:bg-cream transition-colors"
            >
              <FaWhatsapp /> Chat With Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
