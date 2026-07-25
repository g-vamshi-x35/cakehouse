import SimilarProducts from "./SimilarProducts";
import { getSimilarProducts } from "@/lib/data/products";
import type { Product } from "@/data/products";

// Own async component (rather than a prop from the page) so it can sit
// behind a <Suspense> boundary and stream in without blocking the
// above-the-fold gallery/price/order panel on this extra query.
export default async function SimilarProductsSection({ product }: { product: Product }) {
  const similar = await getSimilarProducts(product);
  return <SimilarProducts products={similar} />;
}
