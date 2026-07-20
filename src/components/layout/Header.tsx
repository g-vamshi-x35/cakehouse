"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
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

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-semibold tracking-wide uppercase transition-colors ${
                    active ? "text-rose" : "text-brown hover:text-rose"
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
          className="absolute inset-0 bg-ink/50"
          onClick={() => setMobileOpen(false)}
        />
        <nav
          className={`absolute top-0 right-0 h-full w-4/5 max-w-xs bg-cream-light shadow-2xl px-8 pt-24 flex flex-col gap-6 transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`font-heading text-2xl ${
                pathname === link.href ? "text-rose" : "text-brown"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/menu"
            onClick={() => setMobileOpen(false)}
            className="mt-4 text-center rounded-full bg-rose text-white font-semibold px-5 py-3 hover:bg-brown transition-colors"
          >
            Order Now
          </Link>
        </nav>
      </div>

      <CartDrawer />
    </>
  );
}
