"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";

type Props = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  deliveryDate?: string;
  redirectQuery?: string;
};

export default function OrderSuccessModal({
  orderId,
  orderNumber,
  customerName,
  total,
  deliveryDate,
  redirectQuery,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/checkout/success/${orderId}${redirectQuery ?? ""}`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [orderId, redirectQuery, router]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-cream-light rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl animate-[popIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose/15 flex items-center justify-center mb-4">
          <FiCheckCircle className="text-rose text-4xl" />
        </div>

        <h2 className="font-heading text-xl text-brown">Order Placed Successfully!</h2>
        <div className="mt-2 space-y-0.5 text-sm text-ink/70">
          <p>🎉 Thank you for choosing Cake House.</p>
          <p>📦 Your order has been received.</p>
          <p>📞 We&apos;ll contact you shortly to confirm your order.</p>
        </div>

        <div className="mt-5 bg-cream rounded-2xl p-4 text-left text-sm space-y-1.5">
          <Row label="Order ID" value={`#${orderNumber}`} />
          <Row label="Customer Name" value={customerName} />
          <Row label="Total Amount" value={`₹${total}`} />
          {deliveryDate && <Row label="Delivery Date" value={deliveryDate} />}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink/40">
          <span className="w-3.5 h-3.5 border-2 border-rose border-t-transparent rounded-full animate-spin" />
          Redirecting…
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-3">
      <span className="text-ink/50">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </p>
  );
}
