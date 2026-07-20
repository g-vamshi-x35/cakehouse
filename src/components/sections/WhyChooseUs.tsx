import { FiFeather, FiTruck, FiHeart, FiAward } from "react-icons/fi";
import SectionReveal from "@/components/ui/SectionReveal";

const FEATURES = [
  {
    icon: FiFeather,
    title: "100% Veg & Egg-Free",
    desc: "Every cake is made without eggs, using only vegetarian ingredients.",
  },
  {
    icon: FiHeart,
    title: "Handcrafted Fresh",
    desc: "Baked and decorated by hand in our own kitchen — nothing off a shelf.",
  },
  {
    icon: FiAward,
    title: "Fully Customized",
    desc: "Theme cakes, doll cakes, car cakes — designed exactly how you imagine.",
  },
  {
    icon: FiTruck,
    title: "Home Delivery",
    desc: "Order ahead on WhatsApp or by phone and we'll get it to your door.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-cream-light py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            Why Cake House
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown">
            Why Choose Our Bakery
          </h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <SectionReveal key={f.title} delay={i * 0.08}>
              <div className="h-full bg-cream rounded-3xl p-7 text-center hover:-translate-y-1.5 transition-transform duration-300 shadow-sm hover:shadow-lg">
                <div className="w-14 h-14 mx-auto rounded-full bg-rose/15 text-rose flex items-center justify-center text-2xl mb-5">
                  <f.icon />
                </div>
                <h3 className="font-heading text-lg text-brown mb-2">{f.title}</h3>
                <p className="text-sm text-ink/70 leading-relaxed">{f.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
