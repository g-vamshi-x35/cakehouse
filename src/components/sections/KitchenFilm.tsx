import LazyVideo from "@/components/ui/LazyVideo";
import SectionReveal from "@/components/ui/SectionReveal";

export default function KitchenFilm() {
  return (
    <section className="bg-cream-light py-20 md:py-24">
      <div className="container-px">
        <SectionReveal className="relative overflow-hidden rounded-[2rem] aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] shadow-[0_30px_80px_-30px_rgba(31,20,17,0.5)]">
          <LazyVideo src="/video/about-kitchen.mp4" poster="/video/about-kitchen.jpg" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/10 to-transparent" />
          <div className="absolute bottom-0 p-6 md:p-12 max-w-xl">
            <p className="text-gold font-semibold tracking-[0.4em] uppercase text-xs mb-3">Inside Our Kitchen</p>
            <h2 className="font-heading text-3xl md:text-5xl text-cream leading-tight">Where Every Cake Begins</h2>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
