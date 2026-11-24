import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/ui/SectionReveal";

const TILES = [
  { title: "Celebration Cakes", sub: "Birthdays & big moments", href: "/menu?tag=birthday-cakes", img: "/images/stylish/celebration-slice.jpg", big: true, focus: "object-[50%_45%]" },
  { title: "Chocolate Indulgence", sub: "Truffle, ganache & more", href: "/menu?tag=chocolate-cakes", img: "/images/stylish/chocolate-cherry.jpg" },
  { title: "Anniversary Cakes", sub: "Made to say it sweetly", href: "/menu?tag=anniversary-cakes", img: "/images/stylish/red-velvet.jpg" },
  { title: "Fresh Fruit Cakes", sub: "Berries, mango & fruit", href: "/menu?tag=fruit-cakes", img: "/images/stylish/blueberry-cheesecake.jpg" },
];

export default function PremiumCollections() {
  return (
    <section className="bg-[#f7eedb] py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-gold font-semibold tracking-[0.4em] uppercase text-xs mb-3">Premium Collections</p>
          <h2 className="font-heading text-4xl md:text-5xl text-espresso leading-tight">
            Crafted For Every <span className="italic text-brown">Occasion</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-20 bg-gold/60" />
        </SectionReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 md:gap-5 lg:h-[640px]">
          {TILES.map((t, i) => (
            <SectionReveal
              key={t.title}
              delay={i * 0.08}
              className={t.big ? "col-span-2 lg:col-span-2 lg:row-span-2" : i === 3 ? "col-span-2 lg:col-span-2" : ""}
            >
              <Link
                href={t.href}
                className={`group relative block h-full overflow-hidden rounded-[1.75rem] ${t.big ? "aspect-[4/3] lg:aspect-auto" : i === 3 ? "aspect-[2/1] lg:aspect-auto" : "aspect-[3/4] lg:aspect-auto"}`}
              >
                <Image
                  src={t.img}
                  alt={t.title}
                  fill
                  sizes={t.big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className={`object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06] ${"focus" in t ? t.focus : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/15 to-transparent" />
                <div className="absolute bottom-0 p-5 md:p-7">
                  <p className="text-gold text-[11px] tracking-[0.3em] uppercase font-semibold mb-1">{t.sub}</p>
                  <h3 className={`font-heading text-cream leading-tight ${t.big ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>{t.title}</h3>
                  <span className="mt-3 inline-block text-cream/80 text-sm font-semibold border-b border-gold/60 pb-0.5 group-hover:text-gold transition-colors">
                    Explore
                  </span>
                </div>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
