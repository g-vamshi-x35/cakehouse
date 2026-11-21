import Image from "next/image";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionReveal from "@/components/ui/SectionReveal";

const IDEAS = [
  "Fresh berries & drip finishes",
  "Hand-piped rosettes in your colours",
  "Names, ages & messages in cream",
  "Cartoon, princess & theme toppers",
];

export default function CustomInspiration() {
  return (
    <section className="bg-espresso py-20 md:py-28 overflow-hidden">
      <div className="container-px grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
        <SectionReveal>
          <p className="text-gold font-semibold tracking-[0.4em] uppercase text-xs mb-3">Inspiration</p>
          <h2 className="font-heading text-4xl md:text-5xl text-cream leading-tight mb-5">
            Your Idea, <span className="italic text-gold">Our Hands</span>
          </h2>
          <p className="text-cream-light/75 leading-relaxed mb-8">
            Tell us the occasion and the feeling — we&apos;ll design the colours, decorations and details to make it
            unforgettable. A few favourites to spark ideas:
          </p>
          <ul className="space-y-3">
            {IDEAS.map((idea) => (
              <li key={idea} className="flex items-center gap-3 text-cream/90">
                <span className="h-px w-6 bg-gold" /> {idea}
              </li>
            ))}
          </ul>
        </SectionReveal>

        <SectionReveal delay={0.15} className="grid grid-cols-2 gap-4 md:gap-5">
          <div className="relative aspect-[9/16] rounded-[1.75rem] overflow-hidden ring-1 ring-gold/25">
            <LazyVideo
              src="/video/custom-decorating.mp4"
              poster="/video/custom-decorating.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="relative aspect-[9/16] rounded-[1.75rem] overflow-hidden ring-1 ring-gold/25 mt-10">
            <Image
              src="/images/stylish/berry-decorating.jpg"
              alt="Decorating a celebration cake with fresh berries"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
