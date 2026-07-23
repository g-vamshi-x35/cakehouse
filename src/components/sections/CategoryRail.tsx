import SectionReveal from "@/components/ui/SectionReveal";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { getAllProducts } from "@/lib/data/products";
import { BROWSE_TAGS, type Product } from "@/data/products";

export default async function CategoryRail({
  tag,
  eyebrow,
  title,
  limit = 6,
  allProducts,
}: {
  tag: string;
  eyebrow: string;
  title: string;
  limit?: number;
  // Pass the already-fetched catalog (e.g. from the homepage, which fetches
  // once and shares it across every rail) to avoid a redundant DB round
  // trip. Falls back to fetching its own copy if used standalone.
  allProducts?: Product[];
}) {
  const all = allProducts ?? (await getAllProducts());
  const products: Product[] = all.filter((p) => p.tags?.includes(tag)).slice(0, limit);

  if (products.length === 0) return null;

  return (
    <section className="bg-cream-light py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">{eyebrow}</p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown">{title}</h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <SectionReveal key={product.id} delay={(i % 3) * 0.1}>
              <ProductCard product={product} />
            </SectionReveal>
          ))}
        </div>

        <SectionReveal className="flex justify-center mt-14">
          <Button href={`/menu?tag=${tag}`} variant="outline" size="lg">
            View All {BROWSE_TAGS[tag] ?? title}
          </Button>
        </SectionReveal>
      </div>
    </section>
  );
}
