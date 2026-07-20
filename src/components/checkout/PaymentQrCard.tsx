import { business } from "@/data/business";

export default function PaymentQrCard({ amount }: { amount: number }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-brown/30 bg-cream p-5 text-center space-y-3">
      <div className="w-40 h-40 mx-auto rounded-xl bg-cream-light border border-brown/15 flex flex-col items-center justify-center text-ink/40 text-xs px-3">
        <span className="text-3xl mb-2">📷</span>
        Shop UPI QR code goes here
      </div>
      <p className="text-sm text-ink/70">
        Scan with any UPI app and pay <span className="font-bold text-brown">₹{amount}</span> to{" "}
        <span className="font-semibold">{business.name}</span>, then tap &ldquo;I&apos;ve Paid&rdquo; below.
      </p>
      <p className="text-xs text-ink/50">
        Or pay directly to {business.phones[0]} via GPay / PhonePe / Paytm UPI.
      </p>
    </div>
  );
}
