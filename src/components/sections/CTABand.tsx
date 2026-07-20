import SectionReveal from "@/components/ui/SectionReveal";
import Button from "@/components/ui/Button";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function CTABand() {
  const whatsappHref = buildWhatsAppLink(
    `Hi ${business.name}! I'd like to place a custom cake order.`
  );

  return (
    <section className="bg-brown py-16 md:py-20">
      <SectionReveal className="container-px flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl text-cream">
            Craving Something Sweet?
          </h2>
          <p className="text-cream-light/80 mt-2 max-w-md">
            Order your custom cake today — message us on WhatsApp or give us a
            call, and we&apos;ll take care of the rest.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 shrink-0">
          <Button href={whatsappHref} external size="lg">
            Order on WhatsApp
          </Button>
          <Button
            href={`tel:+91${business.phones[0]}`}
            variant="outline"
            size="lg"
            className="!text-cream !border-cream hover:!bg-cream hover:!text-brown"
          >
            Call Us
          </Button>
        </div>
      </SectionReveal>
    </section>
  );
}
