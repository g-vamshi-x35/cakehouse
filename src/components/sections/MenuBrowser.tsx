"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import ProductCard from "@/components/ui/ProductCard";
import SectionReveal from "@/components/ui/SectionReveal";
import {
  menuCategories,
  getActiveBrowseTags,
  searchProducts,
  type MenuCategoryId,
  type Product,
} from "@/data/products";

type SortOption = "popular" | "newest" | "price-low" | "price-high" | "best-selling";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "best-selling", label: "Best Selling" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

function startingPrice(product: Product): number {
  const priced = product.weightOptions?.filter((w) => w.price != null) ?? [];
  return priced[0]?.price ?? product.price;
}

export default function MenuBrowser({ products }: { products: Product[] }) {
  const [active, setActive] = useState<MenuCategoryId>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [weight, setWeight] = useState<string>("any");
  const [availableToday, setAvailableToday] = useState(false);
  const [sort, setSort] = useState<SortOption>("popular");

  const activeTags = useMemo(() => getActiveBrowseTags(products), [products]);
  const weightLabels = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      for (const w of p.weightOptions ?? []) {
        if (w.price != null) set.add(w.label);
      }
    }
    return Array.from(set);
  }, [products]);

  const items = useMemo(() => {
    let result = active === "all" ? products : products.filter((p) => p.category === active);
    if (tag) result = result.filter((p) => p.tags?.includes(tag));
    if (query.trim()) result = searchProducts(result, query);
    if (weight !== "any") {
      result = result.filter((p) => p.weightOptions?.some((w) => w.label === weight && w.price != null));
    }
    if (availableToday) result = result.filter((p) => p.available !== false);

    const sorted = [...result];
    switch (sort) {
      case "price-low":
        sorted.sort((a, b) => startingPrice(a) - startingPrice(b));
        break;
      case "price-high":
        sorted.sort((a, b) => startingPrice(b) - startingPrice(a));
        break;
      case "best-selling":
        sorted.sort(
          (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || (b.avgRating ?? 0) - (a.avgRating ?? 0)
        );
        break;
      case "newest":
        sorted.reverse();
        break;
      case "popular":
      default:
        sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    }
    return sorted;
  }, [products, active, tag, query, weight, availableToday, sort]);

  function resetFilters() {
    setActive("all");
    setTag(null);
    setQuery("");
    setWeight("any");
    setAvailableToday(false);
  }

  return (
    <section className="bg-cream-light py-16 md:py-20">
      <div className="container-px">
        <div className="max-w-xl mx-auto mb-8 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cakes, pizza, patties…"
            className="w-full rounded-full border-2 border-brown/15 bg-cream pl-11 pr-10 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-rose transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brown/40 hover:text-rose transition-colors"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {menuCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-colors ${
                active === cat.id
                  ? "bg-brown text-cream-light border-brown"
                  : "bg-transparent text-brown border-brown/25 hover:border-rose hover:text-rose"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {activeTags.map((t) => (
              <button
                key={t.id}
                onClick={() => setTag(tag === t.id ? null : t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  tag === t.id
                    ? "bg-rose text-white border-rose"
                    : "bg-cream text-brown/70 border-brown/15 hover:border-rose hover:text-rose"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mb-14 text-sm">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-full border-2 border-brown/15 bg-cream px-4 py-2 text-brown font-semibold focus:outline-none focus:border-rose"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                Sort: {o.label}
              </option>
            ))}
          </select>

          {weightLabels.length > 0 && (
            <select
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="rounded-full border-2 border-brown/15 bg-cream px-4 py-2 text-brown font-semibold focus:outline-none focus:border-rose"
            >
              <option value="any">Any Weight</option>
              {weightLabels.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-2 rounded-full border-2 border-brown/15 bg-cream px-4 py-2 text-brown font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={availableToday}
              onChange={(e) => setAvailableToday(e.target.checked)}
              className="accent-rose"
            />
            Available Today
          </label>
        </div>

        {items.length === 0 ? (
          <div className="text-center space-y-3">
            <p className="text-ink/60">No products match your search/filters.</p>
            <button onClick={resetFilters} className="text-rose font-semibold hover:text-brown">
              Clear filters →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product, i) => (
              <SectionReveal key={product.id} delay={(i % 3) * 0.08} y={24}>
                <ProductCard product={product} />
              </SectionReveal>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-ink/50 mt-14">
          Prices for regular cakes shown as 500g / 1000g. Customized cake pricing
          depends on design — confirm final pricing at checkout or on WhatsApp.
        </p>
      </div>
    </section>
  );
}
