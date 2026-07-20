import Image from "next/image";
import SectionReveal from "@/components/ui/SectionReveal";

const GALLERY_IMAGES = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/images/gallery/gallery-${n}.jpg`;
});

export default function Gallery() {
  return (
    <section className="bg-cream-light py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            From Our Kitchen
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown">
            A Peek At Our Cakes
          </h2>
        </SectionReveal>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {GALLERY_IMAGES.map((src, i) => (
            <SectionReveal key={src} delay={(i % 4) * 0.06} y={20} className="break-inside-avoid">
              <div className="group relative rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={src}
                  alt="A custom cake handcrafted by Cake House"
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
