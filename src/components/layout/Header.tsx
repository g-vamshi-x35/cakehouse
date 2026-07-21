"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiUser,
  FiPackage,
  FiHeart,
  FiShield,
  FiPhone,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { business } from "@/data/business";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/custom-cake", label: "Custom Cake" },
  { href: "/about", label: "About" },
  { href: "/classes", label: "Classes" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { count, open: openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[60] transition-all duration-300 ${
          scrolled
            ? "bg-cream-light/90 backdrop-blur-md shadow-sm py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container-px flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/images/brand/logo-circle.jpg"
              alt="Cake House logo"
              width={44}
              height={44}
              className="rounded-full object-cover w-10 h-10 md:w-11 md:h-11"
              priority
            />
            <span className="font-heading text-xl md:text-2xl font-bold text-brown leading-none">
              Cake House
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                    active
                      ? "text-rose"
                      : scrolled
                        ? "text-brown hover:text-rose"
                        : "text-cream-light hover:text-cream"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-rose rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              prefetch={false}
              className="hidden sm:inline-flex p-2 text-brown hover:text-rose transition-colors"
              aria-label="My account"
            >
              <FiUser size={22} />
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 text-brown hover:text-rose transition-colors"
              aria-label="Open cart"
            >
              <FiShoppingBag size={22} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
            <Link
              href="/menu"
              className="hidden md:inline-block ml-2 rounded-full bg-rose text-white text-sm font-semibold px-5 py-2.5 hover:bg-brown transition-colors"
            >
              Order Now
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-brown"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <nav
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-cream-light shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-brown/10 shrink-0">
            <span className="font-heading text-xl text-brown">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-1.5 text-brown/60 hover:text-rose transition-colors"
            >
              <FiX size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">
            {NAV_LINKS.map((link) => (
              <DrawerLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href}
                onClick={() => setMobileOpen(false)}
              />
            ))}

            <DrawerDivider />
            <DrawerLink href="/account" label="My Account" icon={FiUser} onClick={() => setMobileOpen(false)} prefetch={false} />
            <DrawerLink href="/account/orders" label="My Orders" icon={FiPackage} onClick={() => setMobileOpen(false)} prefetch={false} />
            <DrawerLink href="/account/wishlist" label="Wishlist" icon={FiHeart} onClick={() => setMobileOpen(false)} prefetch={false} />

            <DrawerDivider />
            <DrawerLink href="/staff/login" label="Staff / Admin Login" icon={FiShield} onClick={() => setMobileOpen(false)} prefetch={false} />

            <DrawerDivider />
            <DrawerAction href={`tel:+91${business.phones[0]}`} label="Call Bakery" icon={FiPhone} />
            <DrawerAction
              href={buildWhatsAppLink(`Hi ${business.name}! I have a question.`)}
              label="WhatsApp Order"
              icon={FaWhatsapp}
            />

            <DrawerDivider />
            <p className="px-3 pb-1 text-xs font-semibold tracking-widest uppercase text-brown/40">Follow Us</p>
            <DrawerAction href={business.instagram} label="Instagram" icon={FiInstagram} />
            <DrawerAction href={business.youtube} label="YouTube" icon={FiYoutube} />
          </div>

          <div className="p-6 border-t border-brown/10 shrink-0">
            <Link
              href="/menu"
              onClick={() => setMobileOpen(false)}
              className="block text-center rounded-full bg-rose text-white font-semibold px-5 py-3 hover:bg-brown transition-colors"
            >
              Order Now
            </Link>
          </div>
        </nav>
      </div>

      <CartDrawer />
    </>
  );
}

function DrawerDivider() {
  return <div className="h-px bg-brown/10 my-3" />;
}

function DrawerLink({
  href,
  label,
  icon: Icon,
  active = false,
  onClick,
  prefetch = true,
}: {
  href: string;
  label: string;
  icon?: ComponentType<{ size?: number }>;
  active?: boolean;
  onClick: () => void;
  prefetch?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={prefetch}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-colors ${
        active ? "text-rose bg-rose/10" : "text-brown hover:bg-brown/5"
      }`}
    >
      {Icon && <Icon size={17} />}
      {label}
    </Link>
  );
}

function DrawerAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("tel:") ? undefined : "_blank"}
      rel={href.startsWith("tel:") ? undefined : "noopener noreferrer"}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold text-brown hover:bg-brown/5 transition-colors"
    >
      <Icon size={17} />
      {label}
    </a>
  );
}
