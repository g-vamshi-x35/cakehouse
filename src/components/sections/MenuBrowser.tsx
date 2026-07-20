"use client";

import { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import SectionReveal from "@/components/ui/SectionReveal";
import { menuCategories, type MenuCategoryId, type Product } from "@/data/products";

export default function MenuBrowser({ products }: { products: Product[] }) {
  const [active, setActive] = useState<MenuCategoryId>("all");
  const items = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <section className="bg-cream-light py-16 md:py-20">
      <div className="container-px">
        <div className="flex flex-wrap justify-center gap-3 mb-14">
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

        {items.length === 0 ? (
          <p className="text-center text-ink/60">No items in this category yet.</p>
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
