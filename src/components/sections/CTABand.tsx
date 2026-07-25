import { FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import SectionReveal from "@/components/ui/SectionReveal";
import Button from "@/components/ui/Button";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function CTABand() {
  const whatsappHref = buildWhatsAppLink(`Hi ${business.name}! I have a question.`);

  return (
    <section className="relative bg-brown py-16 md:py-20 overflow-hidden">
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-rose/10 pointer-events-none" />
      <div className="absolute -left-10 -bottom-20 w-56 h-56 rounded-full bg-cream/5 pointer-events-none" />

      <SectionReveal className="relative container-px flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl text-cream">
            Craving Something Sweet?
          </h2>
          <p className="text-cream-light/80 mt-2 max-w-md">
            From everyday favourites to fully custom designs — browse our menu or
            tell us your idea, and we&apos;ll take care of the rest.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/custom-cake" size="lg">
              Design a Custom Cake
            </Button>
            <Button
              href={`tel:+91${business.phones[0]}`}
              variant="outline"
              size="lg"
              className="!text-cream !border-cream hover:!bg-cream hover:!text-brown"
            >
              <FiPhone /> Call Us
            </Button>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-cream-light/70 hover:text-cream transition-colors"
          >
            <FaWhatsapp /> Questions? Chat on WhatsApp
          </a>
        </div>
      </SectionReveal>
    </section>
  );
}
