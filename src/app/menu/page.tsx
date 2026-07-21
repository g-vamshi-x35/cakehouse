import type { Metadata } from "next";
import MenuBrowser from "@/components/sections/MenuBrowser";
import PageHero from "@/components/ui/PageHero";
import { getAllProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Menu | Cake House",
  description:
    "Browse Cake House's full menu — regular & customized cakes, pizza, samosa and patties. 100% vegetarian, 100% egg-free.",
};

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function MenuPage({ searchParams }: Props) {
  const products = await getAllProducts();
  const { tag } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Full Menu"
        title="Crafted Fresh, Every Single Day"
        subtitle="From classic flavours to fully customized theme cakes and quick snacks — everything is made fresh in-house."
      />
      <MenuBrowser products={products} initialTag={tag ?? null} />
    </>
  );
}
