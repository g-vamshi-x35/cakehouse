"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMinus, FiPlus, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import type { Product } from "@/data/products";
import { useQuickOrder } from "@/components/order/QuickOrderContext";
import { orderOnWhatsAppLink } from "@/lib/whatsapp";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

function minAdvanceLeadHours() {
  return 3.5; // midpoint of the "3-4 hours" notice
}

export default function ProductOrderPanel({ product }: { product: Product }) {
  const { hydrated } = useQuickOrder();
  // Remount once localStorage hydration completes so the WhatsApp fallback
  // link below picks up any previously saved name/phone/address.
  return <ProductOrderPanelInner key={hydrated ? "ready" : "loading"} product={product} />;
}

function ProductOrderPanelInner({ product }: { product: Product }) {
  const { open, savedInfo } = useQuickOrder();
  // Theme/design cakes need a real design conversation, not a quick-buy form.
  const isCustomCake = product.category === "customized-cakes";

  const weightOptions = product.weightOptions;
  const [weight, setWeight] = useState(weightOptions?.[0]?.label);
  const [flavour, setFlavour] = useState(product.flavours?.[0]);
  const [qty, setQty] = useState(1);
  const [customMessage, setCustomMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const selectedWeightOption = weightOptions?.find((w) => w.label === weight);
  const isCustomWeight = weight === "Custom" || (selectedWeightOption && selectedWeightOption.price == null);
  const unitPrice = isCustomWeight ? null : selectedWeightOption?.price ?? product.price;
  const total = unitPrice != null ? unitPrice * qty : null;
  const compareAtTotal =
    !isCustomWeight && selectedWeightOption?.compareAtPrice
      ? selectedWeightOption.compareAtPrice * qty
      : undefined;

  const isUnavailable = product.available === false;
  // Weight/flavour always have a valid default the moment options exist, so
  // the one gate that actually needs enforcing is delivery date & time —
  // a bakery can't plan production without knowing when it's needed.
  const missingSchedule = product.type === "cake" && (!eventDate || !eventTime);
  const canOrder = !isCustomWeight && !isUnavailable && !missingSchedule;

  const [leadTimeWarning, setLeadTimeWarning] = useState(false);

  function checkLeadTime(date: string, time: string) {
    if (!date || !time) {
      setLeadTimeWarning(false);
      return;
    }
    const target = new Date(`${date}T${time}`);
    if (Number.isNaN(target.getTime())) {
      setLeadTimeWarning(false);
      return;
    }
    const hoursAway = (target.getTime() - Date.now()) / (1000 * 60 * 60);
    setLeadTimeWarning(hoursAway < minAdvanceLeadHours() && hoursAway >= 0);
  }

  function handleOrderNow() {
    open(product, {
      weight,
      flavour,
      qty,
      customMessage: customMessage || undefined,
      eventDate: eventDate || undefined,
      eventTime: eventTime || undefined,
    });
  }

  const whatsappHref = orderOnWhatsAppLink({
    name: product.name,
    weightLabel: weight,
    flavour,
    qty,
    priceLabel: total != null ? `₹${total}` : "price on request",
    customMessage,
    eventDate,
    eventTime,
    customerName: savedInfo.name,
    phone: savedInfo.phone,
    address: savedInfo.address,
    deliveryInstructions: savedInfo.deliveryInstructions,
  });

  if (isCustomCake) {
    return (
      <div className="bg-cream-light rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <p className="text-rose font-bold text-2xl">
            {isCustomWeight ? "Price on request" : `From ₹${unitPrice}`}
          </p>
          {product.note && <p className="text-xs text-ink/50 mt-1">{product.note}</p>}
        </div>
        <p className="text-sm text-ink/70 leading-relaxed">
          This is a custom design cake — tell us the theme, size and any inspiration photos and
          we&apos;ll get back to you with a design and a quote.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/custom-cake?product=${product.slug}`}
            className="flex-1 inline-flex items-center justify-center rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors"
          >
            Request Custom Quote
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold py-3.5 hover:opacity-90 transition-opacity"
          >
            <FaWhatsapp size={18} /> WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-light rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-rose font-bold text-2xl flex items-center flex-wrap gap-2">
            {isCustomWeight ? "Price on request" : `₹${total}`}
            {compareAtTotal != null && (
              <span className="text-ink/40 text-base font-normal line-through">₹{compareAtTotal}</span>
            )}
            {!isCustomWeight && qty > 1 && (
              <span className="text-sm text-ink/50 font-normal">(₹{unitPrice} each)</span>
            )}
          </p>
          {product.note && <p className="text-xs text-ink/50 mt-1">{product.note}</p>}
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
            isUnavailable ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isUnavailable ? "Currently Unavailable" : "In Stock"}
        </span>
      </div>

      {weightOptions && weightOptions.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-brown mb-2">Weight</p>
          <div className="flex flex-wrap gap-2">
            {weightOptions.map((w) => (
              <button
                key={w.label}
                onClick={() => setWeight(w.label)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                  weight === w.label
                    ? "bg-brown text-cream-light border-brown"
                    : "bg-cream text-brown border-brown/20 hover:border-rose"
                }`}
              >
                {w.label}
                {w.price != null && (
                  <span className="ml-1 font-normal opacity-80">
                    ₹{w.price}
                    {w.compareAtPrice && (
                      <span className="ml-1 line-through opacity-60">₹{w.compareAtPrice}</span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.flavours && product.flavours.length > 1 && (
        <div>
          <p className="text-sm font-semibold text-brown mb-2">Flavour</p>
          <div className="flex flex-wrap gap-2">
            {product.flavours.map((f) => (
              <button
                key={f}
                onClick={() => setFlavour(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                  flavour === f
                    ? "bg-brown text-cream-light border-brown"
                    : "bg-cream text-brown border-brown/20 hover:border-rose"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-brown mb-2">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-brown/20 text-brown hover:border-rose hover:text-rose transition-colors"
            aria-label="Decrease quantity"
          >
            <FiMinus />
          </button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-brown/20 text-brown hover:border-rose hover:text-rose transition-colors"
            aria-label="Increase quantity"
          >
            <FiPlus />
          </button>
        </div>
      </div>

      {product.type === "cake" && (
        <div>
          <label className="text-sm font-semibold text-brown mb-2 block">
            Message to write on the cake <span className="font-normal text-ink/40">(optional)</span>
          </label>
          <input
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder='e.g. "Happy Birthday Aarav!"'
            maxLength={60}
            className={inputClasses}
          />
        </div>
      )}

      {product.type === "cake" && (
        <div>
          <label className="text-sm font-semibold text-brown mb-2 block">
            When do you need it?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => {
                setEventDate(e.target.value);
                checkLeadTime(e.target.value, eventTime);
              }}
              className={inputClasses}
            />
            <input
              type="time"
              value={eventTime}
              onChange={(e) => {
                setEventTime(e.target.value);
                checkLeadTime(eventDate, e.target.value);
              }}
              className={inputClasses}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-brown/70 mt-2">
            <FiClock className="shrink-0" /> Please place your order at least 3–4 hours in advance.
          </p>
          {leadTimeWarning && (
            <p className="text-xs text-red-600 mt-1">
              That&apos;s less than 3–4 hours away — please call us to confirm we can make it in time.
            </p>
          )}
        </div>
      )}

      {missingSchedule && (
        <p className="text-xs text-brown/70 bg-cream rounded-lg px-4 py-2">
          Please choose a delivery date and time above to continue.
        </p>
      )}

      <button
        onClick={handleOrderNow}
        disabled={!canOrder}
        className="w-full rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Order Now
      </button>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold py-3.5 hover:opacity-90 transition-opacity"
      >
        <FaWhatsapp size={18} /> Order on WhatsApp
      </a>

      {isCustomWeight && (
        <p className="text-xs text-center text-ink/50">
          Custom sizing needs a quick chat — message us on WhatsApp for a quote.
        </p>
      )}
      {isUnavailable && (
        <p className="text-xs text-center text-red-600">
          This item is currently unavailable for online ordering — message us on WhatsApp to check.
        </p>
      )}
    </div>
  );
}
