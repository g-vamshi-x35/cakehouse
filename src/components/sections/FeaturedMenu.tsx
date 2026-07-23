import SectionReveal from "@/components/ui/SectionReveal";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import type { Product } from "@/data/products";

export default function FeaturedMenu({ products }: { products: Product[] }) {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            Fan Favourites
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown">
            Our Bestselling Cakes
          </h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <SectionReveal key={product.id} delay={(i % 3) * 0.1}>
              <ProductCard product={product} />
            </SectionReveal>
          ))}
        </div>

        <SectionReveal className="flex justify-center mt-14">
          <Button href="/menu" size="lg">
            View Full Menu
          </Button>
        </SectionReveal>
      </div>
    </section>
  );
}
