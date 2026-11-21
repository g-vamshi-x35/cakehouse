import Image from "next/image";
import SectionReveal from "@/components/ui/SectionReveal";
import LazyVideo from "@/components/ui/LazyVideo";
import Button from "@/components/ui/Button";

export default function CraftShowcase() {
  return (
    <section className="bg-cream-light py-20 md:py-28 overflow-hidden">
      <div className="container-px grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <SectionReveal className="relative">
          <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(31,20,17,0.5)]">
            <LazyVideo
              src="/video/craft-cake-slice.mp4"
              poster="/video/craft-cake-slice.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="hidden sm:block absolute -bottom-10 -right-4 lg:-right-10 w-40 md:w-52 aspect-[3/4] rounded-[1.5rem] overflow-hidden ring-8 ring-cream-light shadow-xl">
            <Image src="/images/stylish/cream-piping.jpg" alt="Piping fresh cream by hand" fill sizes="208px" className="object-cover" />
          </div>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <p className="text-gold font-semibold tracking-[0.4em] uppercase text-xs mb-3">The Craft</p>
          <h2 className="font-heading text-4xl md:text-5xl text-espresso leading-tight mb-5">
            Baked Fresh. <br className="hidden md:block" />
            <span className="italic text-brown">Finished By Hand.</span>
          </h2>
          <p className="text-ink/70 leading-relaxed mb-4">
            Every layer is baked the same day, every rosette piped by hand, every cake finished with care — 100%
            vegetarian and completely egg-free.
          </p>
          <ul className="grid grid-cols-3 gap-4 my-8 text-center">
            {[
              ["100%", "Eggless"],
              ["Same-day", "Fresh bakes"],
              ["Hand", "Decorated"],
            ].map(([a, b]) => (
              <li key={b} className="rounded-2xl bg-white/70 ring-1 ring-gold/25 py-4 px-2">
                <p className="font-heading text-xl md:text-2xl text-brown">{a}</p>
                <p className="text-xs text-ink/60 mt-1">{b}</p>
              </li>
            ))}
          </ul>
          <Button href="/custom-cake" size="lg">
            Design Your Cake
          </Button>
        </SectionReveal>
      </div>
    </section>
  );
}
