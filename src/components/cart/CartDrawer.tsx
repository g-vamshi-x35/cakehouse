"use client";

import Image from "next/image";
import Link from "next/link";
import { FiX, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { useCart } from "./CartContext";
import { cartWhatsAppLink } from "@/lib/whatsapp";

export default function CartDrawer() {
  const { items, isOpen, close, updateQty, removeItem, count, subtotal, checkoutInfo } = useCart();

  const whatsappHref = cartWhatsAppLink(
    items.map((i) => ({
      name: i.name,
      qty: i.qty,
      priceLabel: `₹${i.unitPrice}`,
      weightLabel: i.weightLabel,
      flavour: i.flavour,
      customMessage: i.customMessage,
      eventDate: i.eventDate,
      eventTime: i.eventTime,
    })),
    checkoutInfo
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-ink/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 right-0 z-[80] h-full w-full max-w-sm bg-cream-light shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Your cart"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-brown/15">
          <h2 className="font-heading text-xl text-brown flex items-center gap-2">
            <FiShoppingBag /> Your Cart
          </h2>
          <button
            onClick={close}
            aria-label="Close cart"
            className="text-brown/70 hover:text-rose transition-colors p-1"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-brown/60 text-sm mt-10 text-center">
              Your cart is empty. Add something sweet from the menu!
            </p>
          ) : (
            items.map((item) => (
              <div key={item.lineId} className="flex gap-3 items-start">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🎂
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink truncate">{item.name}</p>
                  <p className="text-xs text-brown/70">
                    ₹{item.unitPrice}
                    {item.weightLabel ? ` · ${item.weightLabel}` : ""}
                    {item.flavour ? ` · ${item.flavour}` : ""}
                  </p>
                  {item.customMessage && (
                    <p className="text-[11px] text-ink/50 italic truncate">&ldquo;{item.customMessage}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateQty(item.lineId, item.qty - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full border border-brown/30 text-brown hover:bg-rose hover:text-white hover:border-rose transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="text-sm w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.lineId, item.qty + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full border border-brown/30 text-brown hover:bg-rose hover:text-white hover:border-rose transition-colors"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.lineId)}
                  className="text-brown/40 hover:text-rose transition-colors"
                  aria-label={`Remove ${item.name}`}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-brown/15 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brown/60">
                {count} item{count !== 1 ? "s" : ""}
              </span>
              <span className="font-bold text-brown">Subtotal: ₹{subtotal}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full text-center rounded-full bg-rose text-white font-semibold py-3 hover:bg-brown transition-colors"
            >
              Checkout
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center rounded-full border-2 border-brown text-brown font-semibold py-3 hover:bg-brown hover:text-cream-light transition-colors"
            >
              Order on WhatsApp
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
