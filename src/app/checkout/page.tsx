import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout | Cake House" };

export default function CheckoutPage() {
  return (
    <>
      <PageHero eyebrow="Almost There" title="Checkout" />
      <section className="bg-cream-light py-12 md:py-16">
        <div className="container-px max-w-5xl mx-auto">
          <CheckoutForm />
        </div>
      </section>
    </>
  );
}
