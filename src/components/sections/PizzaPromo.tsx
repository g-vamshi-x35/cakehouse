import Link from "next/link";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionReveal from "@/components/ui/SectionReveal";

export default function PizzaPromo({ fromPrice }: { fromPrice: number | null }) {
  return (
    <section className="relative isolate overflow-hidden">
      <LazyVideo src="/video/promo-pizza.mp4" poster="/video/promo-pizza.jpg" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-espresso/90 via-espresso/60 to-espresso/20" />
      <div className="container-px py-20 md:py-28">
        <SectionReveal className="max-w-lg">
          <p className="text-gold font-semibold tracking-[0.4em] uppercase text-xs mb-3">Hot From Our Oven</p>
          <h2 className="font-heading text-4xl md:text-5xl text-cream leading-tight mb-4">
            Freshly Made <span className="italic text-gold">Veg Pizzas</span>
          </h2>
          <p className="text-cream-light/80 leading-relaxed mb-8">
            Hand-stretched dough, rich tomato sauce and loads of cheese — onion, sweetcorn, paneer and more.
            {fromPrice != null && (
              <>
                {" "}Starting at just <span className="font-bold text-gold">₹{fromPrice}</span>.
              </>
            )}
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-gold text-espresso px-8 py-4 font-semibold tracking-wide hover:bg-cream transition-colors"
          >
            Order Pizza
          </Link>
        </SectionReveal>
      </div>
    </section>
  );
}
