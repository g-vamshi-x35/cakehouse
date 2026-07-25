import { FiMapPin, FiClock, FiPhone, FiMail, FiInstagram, FiYoutube, FiNavigation } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const ITEMS = [
  {
    icon: FiClock,
    label: "Opening Hours",
    value: business.hours.map((h) => `${h.label}: ${h.value}`).join(" · "),
  },
];

export default function ContactInfo() {
  const whatsappHref = buildWhatsAppLink(`Hi ${business.name}! I have a question.`);
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    `${business.name}, ${business.address}`
  )}&output=embed`;

  return (
    <div className="space-y-6">
      <div className="bg-cream rounded-2xl p-5">
        <div className="flex gap-4">
          <div className="w-11 h-11 shrink-0 rounded-full bg-rose/15 text-rose flex items-center justify-center text-lg">
            <FiMapPin />
          </div>
          <div>
            <p className="font-heading text-brown text-lg">Visit Us</p>
            <p className="text-ink/70 text-sm mt-0.5">{business.address}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden mt-4 aspect-video">
          <iframe
            src={mapEmbedSrc}
            title="Cake House location"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href={business.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-rose font-semibold hover:text-brown transition-colors mt-3"
        >
          <FiNavigation size={13} /> Get Directions
        </a>
      </div>

      {ITEMS.map((item) => (
        <div key={item.label} className="flex gap-4 bg-cream rounded-2xl p-5">
          <div className="w-11 h-11 shrink-0 rounded-full bg-rose/15 text-rose flex items-center justify-center text-lg">
            <item.icon />
          </div>
          <div>
            <p className="font-heading text-brown text-lg">{item.label}</p>
            <p className="text-ink/70 text-sm mt-0.5">{item.value}</p>
          </div>
        </div>
      ))}

      <div className="flex gap-4 bg-cream rounded-2xl p-5">
        <div className="w-11 h-11 shrink-0 rounded-full bg-rose/15 text-rose flex items-center justify-center text-lg">
          <FiPhone />
        </div>
        <div>
          <p className="font-heading text-brown text-lg">Call Us</p>
          {business.phones.map((p) => (
            <a key={p} href={`tel:+91${p}`} className="block text-ink/70 text-sm mt-0.5 hover:text-rose transition-colors">
              {p}
            </a>
          ))}
        </div>
      </div>

      <div className="flex gap-4 bg-cream rounded-2xl p-5">
        <div className="w-11 h-11 shrink-0 rounded-full bg-rose/15 text-rose flex items-center justify-center text-lg">
          <FiMail />
        </div>
        <div>
          <p className="font-heading text-brown text-lg">Email Us</p>
          <a href={`mailto:${business.email}`} className="block text-ink/70 text-sm mt-0.5 hover:text-rose transition-colors break-all">
            {business.email}
          </a>
        </div>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold py-3.5 hover:opacity-90 transition-opacity"
      >
        <FaWhatsapp size={18} /> Chat On WhatsApp
      </a>

      <div className="flex items-center justify-center gap-5 text-brown text-xl pt-2">
        <a href={business.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-rose transition-colors">
          <FiInstagram />
        </a>
        <a href={business.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-rose transition-colors">
          <FiYoutube />
        </a>
      </div>
    </div>
  );
}
