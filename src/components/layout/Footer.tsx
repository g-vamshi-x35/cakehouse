import Link from "next/link";
import Image from "next/image";
import { FiInstagram, FiYoutube, FiPhone, FiMessageCircle } from "react-icons/fi";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/custom-cake", label: "Custom Cake" },
  { href: "/about", label: "About Us" },
  { href: "/classes", label: "Bakery Classes" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const whatsappHref = buildWhatsAppLink(`Hi ${business.name}! I have a question.`);

  return (
    <footer className="bg-brown-dark text-cream-light">
      <div className="container-px py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-cream-light/15 text-sm">
        <p>
          <span className="font-semibold">Open:</span>{" "}
          {business.hours.map((h) => `${h.label} · ${h.value}`).join("  ")}
        </p>
        <div className="flex items-center gap-4">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-rose transition-colors"
          >
            <FiMessageCircle /> WhatsApp Order
          </a>
        </div>
      </div>

      <div className="container-px py-12 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr] gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Image
              src="/images/brand/logo-circle.jpg"
              alt="Cake House logo"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <span className="font-heading text-2xl font-bold text-cream">Cake House</span>
          </div>
          <p className="text-cream-light/75 max-w-sm leading-relaxed">
            {business.subBrand} — a family-run bakery serving fresh, 100% vegetarian,
            egg-free cakes and snacks. Every cake is handmade with care, right here in
            our kitchen.
          </p>
          <div className="flex items-center gap-4 mt-5 text-xl">
            <a
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-rose transition-colors"
            >
              <FiInstagram />
            </a>
            <a
              href={business.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-rose transition-colors"
            >
              <FiYoutube />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-lg text-cream mb-4">Quick Links</h3>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-cream-light/75 hover:text-rose transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-lg text-cream mb-4">Get In Touch</h3>
          <ul className="space-y-2.5 text-cream-light/75">
            <li>{business.address}</li>
            {business.phones.map((p) => (
              <li key={p}>
                <a href={`tel:+91${p}`} className="hover:text-rose transition-colors flex items-center gap-2">
                  <FiPhone /> {p}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-px py-5 border-t border-cream-light/15 text-xs text-cream-light/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Cake House. All rights reserved.</p>
        <p>{business.tagline}</p>
      </div>
    </footer>
  );
}
