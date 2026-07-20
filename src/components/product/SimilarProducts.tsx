import SectionReveal from "@/components/ui/SectionReveal";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/data/products";

export default function SimilarProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="container-px">
        <SectionReveal className="mb-10">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-2">
            You Might Also Like
          </p>
          <h2 className="font-heading text-2xl md:text-4xl text-brown">Similar Cakes</h2>
        </SectionReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <SectionReveal key={product.id} delay={(i % 4) * 0.08}>
              <ProductCard product={product} />
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
