"use client";

import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiX, FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/components/cart/CartContext";
import { cartWhatsAppLink } from "@/lib/whatsapp";

export default function AccountCartPage() {
  const { items, hydrated, count, subtotal, checkoutInfo, updateQty, removeItem } = useCart();

  if (!hydrated) {
    return <div className="py-16 text-center text-ink/40">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="bg-cream rounded-3xl p-10 text-center">
        <FiShoppingBag className="mx-auto text-4xl text-brown/30 mb-3" />
        <p className="text-ink/60 mb-5">Your cart is empty.</p>
        <Link href="/menu" className="text-rose font-semibold hover:text-brown">
          Browse the menu →
        </Link>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="bg-cream rounded-3xl p-6 space-y-4">
        <h2 className="font-heading text-xl text-brown">
          Your Cart <span className="text-ink/50 text-base font-normal">({count} item{count !== 1 ? "s" : ""})</span>
        </h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.lineId} className="flex gap-4 items-start bg-cream-light rounded-2xl p-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎂</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink">{item.name}</p>
                <p className="text-xs text-brown/70">
                  ₹{item.unitPrice}
                  {item.weightLabel ? ` · ${item.weightLabel}` : ""}
                  {item.flavour ? ` · ${item.flavour}` : ""}
                </p>
                {item.customMessage && (
                  <p className="text-[11px] text-ink/50 italic truncate">&ldquo;{item.customMessage}&rdquo;</p>
                )}
                <div className="flex items-center gap-2 mt-2">
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
              <div className="flex flex-col items-end justify-between h-full gap-2">
                <button
                  onClick={() => removeItem(item.lineId)}
                  className="text-brown/40 hover:text-rose transition-colors"
                  aria-label={`Remove ${item.name}`}
                >
                  <FiX size={16} />
                </button>
                <span className="font-semibold text-ink text-sm">₹{item.unitPrice * item.qty}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-brown/15 pt-4">
          <span className="text-ink/60">Subtotal</span>
          <span className="font-bold text-brown text-lg">₹{subtotal}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Link
            href="/checkout"
            className="text-center rounded-full bg-rose text-white font-semibold py-3 hover:bg-brown transition-colors"
          >
            Checkout
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center rounded-full border-2 border-brown text-brown font-semibold py-3 hover:bg-brown hover:text-cream-light transition-colors"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
