"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiMinus, FiPlus, FiClock, FiX, FiTag, FiCheck, FiCheckCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { SiRazorpay, SiPhonepe, SiGooglepay, SiPaytm } from "react-icons/si";
import type { Product } from "@/data/products";
import { useQuickOrder } from "./QuickOrderContext";
import { placeQuickOrderAction, validateCouponAction } from "@/lib/actions/orders";
import { QUICK_ORDER_ADVANCE_AMOUNT, MIN_LEAD_HOURS, MAX_LEAD_HOURS_NOTICE } from "@/lib/orders/constants";
import PaymentQrCard from "@/components/checkout/PaymentQrCard";
import { business } from "@/data/business";
import { buildWhatsAppLink, orderOnWhatsAppLink } from "@/lib/whatsapp";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

function minAdvanceLeadHours() {
  return (MIN_LEAD_HOURS + MAX_LEAD_HOURS_NOTICE) / 2;
}

export default function QuickOrderModal() {
  const { openProduct, initialSelection, hydrated, close } = useQuickOrder();

  if (!openProduct) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${openProduct.name}`}
      onClick={close}
    >
      <QuickOrderModalInner
        key={`${openProduct.id}-${hydrated ? "ready" : "loading"}`}
        product={openProduct}
        initialSelection={initialSelection}
        onClose={close}
      />
    </div>
  );
}

type SuccessInfo = {
  orderId: string;
  orderNumber: string;
  total: number;
  advanceAmount: number;
  deliveryDate?: string;
};

function QuickOrderModalInner({
  product,
  initialSelection,
  onClose,
}: {
  product: Product;
  initialSelection: { weight?: string; flavour?: string; qty?: number; customMessage?: string; eventDate?: string; eventTime?: string } | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { savedInfo, setSavedInfo } = useQuickOrder();

  const weightOptions = product.weightOptions;
  const [weight, setWeight] = useState(initialSelection?.weight ?? weightOptions?.[0]?.label);
  const [flavour, setFlavour] = useState(initialSelection?.flavour ?? product.flavours?.[0]);
  const [qty, setQty] = useState(initialSelection?.qty ?? 1);
  const [customMessage, setCustomMessage] = useState(initialSelection?.customMessage ?? "");
  const [eventDate, setEventDate] = useState(initialSelection?.eventDate ?? "");
  const [eventTime, setEventTime] = useState(initialSelection?.eventTime ?? "");
  const [leadTimeWarning, setLeadTimeWarning] = useState(false);

  const [name, setName] = useState(savedInfo.name);
  const [phone, setPhone] = useState(savedInfo.phone);
  const [address, setAddress] = useState(savedInfo.address);
  const [instructions, setInstructions] = useState(savedInfo.deliveryInstructions);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [couponPending, setCouponPending] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [qrPendingOrder, setQrPendingOrder] = useState<SuccessInfo | null>(null);

  const selectedWeightOption = weightOptions?.find((w) => w.label === weight);
  const isCustomWeight = weight === "Custom" || (selectedWeightOption && selectedWeightOption.price == null);
  const unitPrice = isCustomWeight ? null : selectedWeightOption?.price ?? product.price;
  const subtotal = unitPrice != null ? unitPrice * qty : null;
  const total = subtotal != null ? Math.max(0, subtotal - discount) : null;
  const advanceAmount = total != null ? Math.min(QUICK_ORDER_ADVANCE_AMOUNT, total) : null;
  const remaining = total != null && advanceAmount != null ? total - advanceAmount : null;

  const isUnavailable = product.available === false;
  const missingSchedule = product.type === "cake" && (!eventDate || !eventTime);
  const canOrder = !isCustomWeight && !isUnavailable && !missingSchedule;

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

  async function handleApplyCoupon() {
    if (subtotal == null) return;
    setCouponPending(true);
    setCouponMsg(null);
    const result = await validateCouponAction(couponCode, subtotal);
    setCouponPending(false);
    if (!result.ok) {
      setDiscount(0);
      setCouponMsg({ type: "error", text: result.error });
      return;
    }
    setDiscount(result.discount);
    setCouponMsg({ type: "ok", text: `Coupon applied — you saved ₹${result.discount}!` });
  }

  async function handleSubmit() {
    setError("");
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in your name, phone number and delivery address.");
      return;
    }
    if (unitPrice == null) return;

    setSubmitting(true);
    setSavedInfo({ name, phone, address, deliveryInstructions: instructions });

    const paymentMethod: "razorpay" | "qr_manual" = RAZORPAY_KEY_ID ? "razorpay" : "qr_manual";

    const result = await placeQuickOrderAction({
      productId: product.id,
      productName: product.name,
      weightLabel: weight,
      flavour,
      customMessage: customMessage || undefined,
      qty,
      unitPrice,
      customerName: name,
      phone,
      address,
      deliveryInstructions: instructions || undefined,
      eventDate: eventDate || undefined,
      eventTime: eventTime || undefined,
      paymentMethod,
      couponCode: couponCode || undefined,
    });

    if (!result.ok) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }

    if (paymentMethod === "qr_manual") {
      setSubmitting(false);
      setQrPendingOrder({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        total: result.total,
        advanceAmount: result.advanceAmount,
        deliveryDate: eventDate || undefined,
      });
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setSubmitting(false);
      toast.error("Couldn't load the payment gateway. Please try again.");
      return;
    }

    const createRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: result.orderId, amount: result.advanceAmount }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setSubmitting(false);
      toast.error(createData.error || "Could not start payment.");
      return;
    }

    const razorpay = new window.Razorpay({
      key: createData.keyId,
      amount: createData.amount,
      currency: createData.currency,
      name: business.name,
      description: `${product.name} — Order ${result.orderNumber}`,
      order_id: createData.razorpayOrderId,
      prefill: { name, contact: phone },
      theme: { color: "#c37960" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: result.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            isAdvance: true,
          }),
        });
        onClose();
        router.push(`/checkout/success/${result.orderId}?method=razorpay`);
      },
      modal: {
        ondismiss: () => setSubmitting(false),
      },
    });
    razorpay.open();
  }

  function handleQrConfirm() {
    if (!qrPendingOrder) return;
    onClose();
    router.push(
      `/checkout/success/${qrPendingOrder.orderId}?method=qr&amount=${qrPendingOrder.advanceAmount}`
    );
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
    customerName: name,
    phone,
    address,
    deliveryInstructions: instructions,
  });

  return (
    <div
      className="bg-cream-light rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-[popIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
      onClick={(e) => e.stopPropagation()}
    >
      {qrPendingOrder ? (
        <div className="p-6 md:p-8 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose/15 flex items-center justify-center">
            <FiCheckCircle className="text-rose text-4xl" />
          </div>
          <div>
            <h2 className="font-heading text-xl text-brown">Almost there!</h2>
            <p className="text-sm text-ink/70 mt-1">
              Order #{qrPendingOrder.orderNumber} is saved — complete your ₹{qrPendingOrder.advanceAmount}{" "}
              advance payment below to confirm it.
            </p>
          </div>
          <PaymentQrCard amount={qrPendingOrder.advanceAmount} />
          <button
            onClick={handleQrConfirm}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors"
          >
            <FiCheck /> I&apos;ve Paid — View Order
          </button>
        </div>
      ) : (
        <div className="p-5 md:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-cream shrink-0">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎂</div>
                )}
              </div>
              <div>
                <h2 className="font-heading text-lg text-brown leading-snug">{product.name}</h2>
                <p className="text-rose font-bold">
                  {isCustomWeight ? "Price on request" : `₹${total}`}
                  {!isCustomWeight && qty > 1 && (
                    <span className="text-xs text-ink/50 font-normal ml-1">(₹{unitPrice} each)</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-brown/50 hover:text-rose transition-colors p-1 shrink-0"
            >
              <FiX size={22} />
            </button>
          </div>

          {weightOptions && weightOptions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-brown mb-2">Weight</p>
              <div className="flex flex-wrap gap-2">
                {weightOptions.map((w) => (
                  <button
                    key={w.label}
                    onClick={() => setWeight(w.label)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
                      weight === w.label
                        ? "bg-brown text-cream-light border-brown"
                        : "bg-cream text-brown border-brown/20 hover:border-rose"
                    }`}
                  >
                    {w.label}
                    {w.price != null && <span className="ml-1 font-normal opacity-80">₹{w.price}</span>}
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
                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
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

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brown">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-brown/20 text-brown hover:border-rose hover:text-rose transition-colors"
                aria-label="Decrease quantity"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-brown/20 text-brown hover:border-rose hover:text-rose transition-colors"
                aria-label="Increase quantity"
              >
                <FiPlus size={14} />
              </button>
            </div>
          </div>

          {product.type === "cake" && (
            <input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder='Message on cake (optional), e.g. "Happy Birthday Aarav!"'
              maxLength={60}
              className={inputClasses}
            />
          )}

          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className={inputClasses} />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            type="tel"
            className={inputClasses}
          />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Delivery Address"
            rows={2}
            className={`${inputClasses} resize-none`}
          />

          {product.type === "cake" && (
            <div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    checkLeadTime(e.target.value, eventTime);
                  }}
                  className={inputClasses}
                  aria-label="Delivery date"
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => {
                    setEventTime(e.target.value);
                    checkLeadTime(eventDate, e.target.value);
                  }}
                  className={inputClasses}
                  aria-label="Delivery time"
                />
              </div>
              <p className="flex items-center gap-1.5 text-xs text-brown/70 mt-2">
                <FiClock className="shrink-0" /> Please order at least 3–4 hours in advance.
              </p>
              {leadTimeWarning && (
                <p className="text-xs text-red-600 mt-1">
                  That&apos;s less than 3–4 hours away — please call us to confirm we can make it in time.
                </p>
              )}
            </div>
          )}

          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Special instructions (optional)"
            className={inputClasses}
          />

          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code (optional)"
              className={`${inputClasses} flex-1`}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponPending || !couponCode.trim()}
              className="shrink-0 rounded-xl border-2 border-brown/20 text-brown px-4 text-sm font-semibold hover:border-rose hover:text-rose transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <FiTag size={14} /> Apply
            </button>
          </div>
          {couponMsg && (
            <p className={`text-xs -mt-3 ${couponMsg.type === "ok" ? "text-green-700" : "text-red-600"}`}>
              {couponMsg.text}
            </p>
          )}

          {missingSchedule && (
            <p className="text-xs text-brown/70 bg-cream rounded-lg px-4 py-2">
              Please choose a delivery date and time above to continue.
            </p>
          )}

          {!isCustomWeight && !isUnavailable && (
            <div className="bg-cream rounded-2xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-ink/70">
                <span>Total Amount</span>
                <span className="font-semibold text-ink">₹{total}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Advance Payment</span>
                <span className="font-semibold text-ink">₹{advanceAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-brown pt-1 border-t border-brown/15 mt-1.5">
                <span>Remaining (on delivery)</span>
                <span>₹{remaining}</span>
              </div>
              <div className="flex items-center gap-2.5 text-brown/50 pt-2 text-lg">
                <SiRazorpay title="Razorpay" />
                <SiPhonepe title="PhonePe" />
                <SiGooglepay title="Google Pay" />
                <SiPaytm title="Paytm" />
                <span className="text-[11px] text-ink/50 ml-0.5">UPI / Cards</span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canOrder || submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              `Pay ₹${advanceAmount ?? QUICK_ORDER_ADVANCE_AMOUNT} & Place Order`
            )}
          </button>

          {isCustomWeight && (
            <p className="text-xs text-center text-ink/50">
              Custom sizing needs a quick chat —{" "}
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-rose font-semibold">
                message us on WhatsApp
              </a>{" "}
              for a quote.
            </p>
          )}
          {isUnavailable && (
            <p className="text-xs text-center text-red-600">
              This item is currently unavailable for online ordering — message us on WhatsApp to check.
            </p>
          )}

          <a
            href={buildWhatsAppLink(`Hi ${business.name}! I have a question about the ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-brown/60 hover:text-rose transition-colors"
          >
            <FaWhatsapp /> Questions? Chat on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
