import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SectionReveal from "@/components/ui/SectionReveal";
import ContactForm from "@/components/sections/ContactForm";
import ContactInfo from "@/components/sections/ContactInfo";

export const metadata: Metadata = {
  title: "Contact | Cake House",
  description:
    "Get in touch with Cake House — visit us, call, WhatsApp, or send a message to order your next cake.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get In Touch"
        title="We'd Love To Hear From You"
        subtitle="Have a cake idea in mind, or a question about an order? Reach out — we usually reply within the day."
      />
      <section className="bg-cream-light py-16 md:py-20">
        <div className="container-px grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <SectionReveal>
            <ContactForm />
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <ContactInfo />
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
