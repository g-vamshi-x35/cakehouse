import type { Metadata } from "next";
import { FiClock } from "react-icons/fi";
import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Bakery Classes | Cake House",
  description:
    "Cake House bakery classes are coming soon — learn to bake and decorate cakes with us.",
};

export default function ClassesPage() {
  const whatsappHref = buildWhatsAppLink(
    `Hi ${business.name}! I'm interested in your upcoming bakery classes — please let me know when they open.`
  );

  return (
    <>
      <PageHero
        eyebrow="Learn With Us"
        title="Bakery Classes Are Coming Soon"
        subtitle="We're cooking up hands-on baking & cake decorating classes. Want to be the first to know when seats open up?"
      />
      <section className="bg-cream-light py-20 md:py-28">
        <div className="container-px max-w-xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose/15 text-rose flex items-center justify-center text-3xl mb-6">
            <FiClock />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl text-brown mb-3">
            Something Sweet Is In The Oven
          </h2>
          <p className="text-ink/70 leading-relaxed mb-8">
            From beginner cake decorating to advanced fondant work, our bakery
            classes are being planned right now. Message us on WhatsApp and
            we&apos;ll notify you the moment registrations open.
          </p>
          <Button href={whatsappHref} external size="lg">
            Notify Me On WhatsApp
          </Button>
        </div>
      </section>
    </>
  );
}
