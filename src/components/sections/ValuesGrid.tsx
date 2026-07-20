import { GiCakeSlice, GiFruitBowl, GiFamilyHouse } from "react-icons/gi";
import { FiEdit3 } from "react-icons/fi";
import SectionReveal from "@/components/ui/SectionReveal";

const VALUES = [
  {
    icon: GiFruitBowl,
    title: "Quality Ingredients",
    desc: "We use fresh, handpicked, 100% vegetarian ingredients in every recipe.",
  },
  {
    icon: GiCakeSlice,
    title: "Handmade Craft",
    desc: "No shortcuts — every cake is baked and decorated by hand in-house.",
  },
  {
    icon: FiEdit3,
    title: "Made To Order",
    desc: "Tell us your theme and we'll design a cake around your celebration.",
  },
  {
    icon: GiFamilyHouse,
    title: "Family Owned",
    desc: "A local bakery run with care, one order and one customer at a time.",
  },
];

export default function ValuesGrid() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            Our Values
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown">
            What We Stand For
          </h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v, i) => (
            <SectionReveal key={v.title} delay={i * 0.08}>
              <div className="h-full bg-cream-light rounded-3xl p-7 text-center hover:-translate-y-1.5 transition-transform duration-300 shadow-sm hover:shadow-lg">
                <div className="w-14 h-14 mx-auto rounded-full bg-brown/10 text-brown flex items-center justify-center text-2xl mb-5">
                  <v.icon />
                </div>
                <h3 className="font-heading text-lg text-brown mb-2">{v.title}</h3>
                <p className="text-sm text-ink/70 leading-relaxed">{v.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
