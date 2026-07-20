import type { Metadata } from "next";
import MenuBrowser from "@/components/sections/MenuBrowser";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Menu | Cake House",
  description:
    "Browse Cake House's full menu — regular & customized cakes, pizza, samosa and patties. 100% vegetarian, 100% egg-free.",
};

export default function MenuPage() {
  return (
    <>
      <PageHero
        eyebrow="Full Menu"
        title="Crafted Fresh, Every Single Day"
        subtitle="From classic flavours to fully customized theme cakes and quick snacks — everything is made fresh in-house."
      />
      <MenuBrowser />
    </>
  );
}
