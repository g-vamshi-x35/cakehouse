import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CustomCakeForm from "@/components/sections/CustomCakeForm";

export const metadata: Metadata = {
  title: "Design a Custom Cake | Cake House",
  description: "Tell us your dream cake — shape, size, flavour, theme — and we'll bring it to life.",
};

export default function CustomCakePage() {
  return (
    <>
      <PageHero
        eyebrow="Made Just For You"
        title="Design Your Dream Cake"
        subtitle="Pick a shape, size, flavour and theme — upload an inspiration photo if you have one — and we'll get back to you with a custom quote."
      />
      <section className="bg-cream-light py-16 md:py-20">
        <div className="container-px">
          <CustomCakeForm />
        </div>
      </section>
    </>
  );
}
