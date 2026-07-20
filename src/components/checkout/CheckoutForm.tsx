"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiClock, FiTag, FiCheck } from "react-icons/fi";
import { useCart } from "@/components/cart/CartContext";
import { placeOrderAction, validateCouponAction } from "@/lib/actions/orders";
import { MIN_ADVANCE_AMOUNT } from "@/lib/orders/constants";
import PaymentQrCard from "./PaymentQrCard";
import { business } from "@/data/business";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

type PaymentChoice = "razorpay_full" | "razorpay_advance" | "qr_advance";

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

export default function CheckoutForm() {
  const { hydrated, items } = useCart();

  if (!hydrated) {
    return <div className="py-16 text-center text-ink/40">Loading your cart…</div>;
  }
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink/60 mb-6">Your cart is empty.</p>
        <Link href="/menu" className="text-rose font-semibold hover:text-brown">
          Browse the menu →
        </Link>
      </div>
    );
  }

  return <CheckoutFormReady />;
}

function CheckoutFormReady() {
  const router = useRouter();
  const { items, subtotal, checkoutInfo, setCheckoutInfo, clear } = useCart();

  const firstEventDate = items.find((i) => i.eventDate)?.eventDate ?? "";
  const firstEventTime = items.find((i) => i.eventTime)?.eventTime ?? "";

  const [name, setName] = useState(checkoutInfo.name);
  const [phone, setPhone] = useState(checkoutInfo.phone);
  const [email, setEmail] = useState(checkoutInfo.email);
  const [address, setAddress] = useState(checkoutInfo.address);
  const [instructions, setInstructions] = useState(checkoutInfo.deliveryInstructions);
  const [eventDate, setEventDate] = useState(firstEventDate);
  const [eventTime, setEventTime] = useState(firstEventTime);

  const [payment, setPayment] = useState<PaymentChoice>(
    RAZORPAY_KEY_ID ? "razorpay_full" : "qr_advance"
  );
  const [advanceAmount, setAdvanceAmount] = useState(MIN_ADVANCE_AMOUNT);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [couponPending, setCouponPending] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = Math.max(0, subtotal - discount);
  const amountDueNow =
    payment === "razorpay_full" ? total : Math.max(MIN_ADVANCE_AMOUNT, advanceAmount);

  async function handleApplyCoupon() {
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

  async function handlePlaceOrder() {
    setError("");
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in your name, phone number and delivery address.");
      return;
    }

    setSubmitting(true);
    setCheckoutInfo({ name, phone, email, address, deliveryInstructions: instructions });

    const result = await placeOrderAction({
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        weightLabel: i.weightLabel,
        flavour: i.flavour,
        customMessage: i.customMessage,
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
      customerName: name,
      phone,
      email,
      address,
      deliveryInstructions: instructions,
      eventDate,
      eventTime,
      paymentMethod: payment,
      advanceAmount: payment === "razorpay_advance" ? advanceAmount : undefined,
      couponCode: couponCode || undefined,
    });

    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    if (payment === "qr_advance") {
      clear();
      router.push(`/checkout/success/${result.orderId}?method=qr&amount=${result.advanceAmount}`);
      return;
    }

    // Razorpay flow
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setSubmitting(false);
      setError("Couldn't load the payment gateway. Please try again or use the QR option.");
      return;
    }

    const createRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: result.orderId, amount: amountDueNow }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setSubmitting(false);
      setError(createData.error || "Could not start payment.");
      return;
    }

    const razorpay = new window.Razorpay({
      key: createData.keyId,
      amount: createData.amount,
      currency: createData.currency,
      name: business.name,
      description: `Order ${result.orderNumber}`,
      order_id: createData.razorpayOrderId,
      prefill: { name, contact: phone, email },
      theme: { color: "#c37960" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: result.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            isAdvance: payment === "razorpay_advance",
          }),
        });
        clear();
        if (verifyRes.ok) {
          router.push(`/checkout/success/${result.orderId}?method=razorpay`);
        } else {
          router.push(`/checkout/success/${result.orderId}?method=razorpay&unverified=1`);
        }
      },
      modal: {
        ondismiss: () => setSubmitting(false),
      },
    });
    razorpay.open();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
      <div className="space-y-6">
        <div className="bg-cream-light rounded-3xl p-6 space-y-4">
          <h2 className="font-heading text-xl text-brown">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className={inputClasses} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" type="tel" className={inputClasses} />
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" className={inputClasses} />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Delivery Address"
            rows={2}
            className={`${inputClasses} resize-none`}
          />
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Delivery instructions (optional)"
            className={inputClasses}
          />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClasses} />
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={inputClasses} />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-brown/70">
            <FiClock className="shrink-0" /> Please place your order at least 3–4 hours in advance.
          </p>
        </div>

        <div className="bg-cream-light rounded-3xl p-6 space-y-4">
          <h2 className="font-heading text-xl text-brown">Payment</h2>

          {RAZORPAY_KEY_ID && (
            <>
              <PaymentOption
                active={payment === "razorpay_full"}
                onClick={() => setPayment("razorpay_full")}
                title="Pay Full Amount Online"
                subtitle="Card, UPI or Netbanking via Razorpay"
              />
              <PaymentOption
                active={payment === "razorpay_advance"}
                onClick={() => setPayment("razorpay_advance")}
                title={`Pay ₹${MIN_ADVANCE_AMOUNT} Advance Online`}
                subtitle="Balance due on delivery (Cash on Delivery)"
              />
            </>
          )}
          <PaymentOption
            active={payment === "qr_advance"}
            onClick={() => setPayment("qr_advance")}
            title={`Pay ₹${MIN_ADVANCE_AMOUNT} Advance via UPI QR`}
            subtitle="Scan & pay, balance due on delivery"
          />

          {payment === "razorpay_advance" && (
            <div>
              <label className="text-xs text-ink/50 mb-1 block px-1">Advance amount (₹)</label>
              <input
                type="number"
                min={MIN_ADVANCE_AMOUNT}
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(Math.max(MIN_ADVANCE_AMOUNT, Number(e.target.value)))}
                className={inputClasses}
              />
            </div>
          )}

          {payment === "qr_advance" && <PaymentQrCard amount={Math.max(MIN_ADVANCE_AMOUNT, advanceAmount)} />}
        </div>
      </div>

      <div className="bg-cream rounded-3xl p-6 h-fit space-y-4">
        <h2 className="font-heading text-xl text-brown">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.lineId} className="flex justify-between text-sm gap-3">
              <div>
                <p className="font-semibold text-ink">
                  {item.name} <span className="text-ink/50">x{item.qty}</span>
                </p>
                <p className="text-xs text-ink/50">
                  {[item.weightLabel, item.flavour].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="font-semibold text-ink shrink-0">₹{item.unitPrice * item.qty}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Coupon code"
            className={`${inputClasses} flex-1`}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={couponPending}
            className="shrink-0 rounded-xl border-2 border-brown/20 text-brown px-4 text-sm font-semibold hover:border-rose hover:text-rose transition-colors flex items-center gap-1.5"
          >
            <FiTag size={14} /> Apply
          </button>
        </div>
        {couponMsg && (
          <p className={`text-xs ${couponMsg.type === "ok" ? "text-green-700" : "text-red-600"}`}>
            {couponMsg.text}
          </p>
        )}

        <div className="border-t border-brown/15 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-ink/70">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-brown text-base pt-1">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          {payment !== "razorpay_full" && (
            <div className="flex justify-between text-ink/70">
              <span>Due now (advance)</span>
              <span>₹{amountDueNow}</span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-60"
        >
          {submitting ? "Processing..." : payment === "qr_advance" ? "Place Order" : `Pay ₹${amountDueNow}`}
        </button>
      </div>
    </div>
  );
}

function PaymentOption({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 px-4 py-3 flex items-center gap-3 transition-colors ${
        active ? "border-rose bg-cream" : "border-brown/15 bg-cream/40 hover:border-brown/30"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          active ? "border-rose bg-rose text-white" : "border-brown/30"
        }`}
      >
        {active && <FiCheck size={12} />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-brown">{title}</span>
        <span className="block text-xs text-ink/50">{subtitle}</span>
      </span>
    </button>
  );
}
