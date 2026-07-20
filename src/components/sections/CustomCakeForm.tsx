"use client";

import { useActionState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { submitCustomCakeRequestAction, type CustomCakeActionState } from "@/lib/actions/customCake";
import ImageUploadField from "@/components/ui/ImageUploadField";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { business } from "@/data/business";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

const SHAPES = ["Round", "Square", "Heart", "Number / Letter", "Custom Sculpted"];
const SIZES = ["0.5 kg", "1 kg", "1.5 kg", "2 kg", "3 kg+"];
const FLAVOURS = ["Vanilla", "Chocolate", "Butterscotch", "Black Forest", "Red Velvet", "Pineapple"];
const CREAMS = ["Whipped Cream", "Fondant", "Buttercream", "Ganache"];

export default function CustomCakeForm() {
  const [state, formAction, pending] = useActionState<CustomCakeActionState, FormData>(
    submitCustomCakeRequestAction,
    null
  );

  const whatsappHref = buildWhatsAppLink(
    `Hi ${business.name}! I'd like to design a custom cake — can you help?`
  );

  if (state?.success) {
    return (
      <div className="bg-cream rounded-3xl p-10 text-center max-w-xl mx-auto">
        <p className="text-4xl mb-3">🎂</p>
        <h3 className="font-heading text-2xl text-brown mb-2">Request Sent!</h3>
        <p className="text-ink/70">
          Thanks for sharing your idea — we&apos;ll review it and send you a quote soon.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-cream rounded-3xl p-6 md:p-8 space-y-5 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Your Name</label>
          <input name="customerName" required className={inputClasses} />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Phone Number</label>
          <input name="customerPhone" type="tel" required className={inputClasses} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Shape</label>
          <select name="shape" className={inputClasses}>
            {SHAPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Size</label>
          <select name="size" className={inputClasses}>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Layers</label>
          <input name="layers" type="number" min={1} max={5} defaultValue={1} className={inputClasses} />
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Flavour</label>
          <select name="flavour" className={inputClasses}>
            {FLAVOURS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/50 mb-1 block px-1">Cream / Finish</label>
          <select name="creamType" className={inputClasses}>
            {CREAMS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Theme</label>
        <input name="theme" placeholder='e.g. "Superheroes", "Unicorn Garden"' className={inputClasses} />
      </div>

      <ImageUploadField name="inspirationImageUrl" label="Inspiration Photo (optional)" />

      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Special Instructions</label>
        <textarea name="instructions" rows={3} className={`${inputClasses} resize-none`} />
      </div>

      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">When do you need it?</label>
        <input name="eventDate" type="date" className={inputClasses} />
      </div>

      {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send Request for Approval"}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#25D366] text-[#128C4A] font-semibold py-3.5 hover:bg-[#25D366] hover:text-white transition-colors"
        >
          <FaWhatsapp /> Discuss on WhatsApp
        </a>
      </div>
    </form>
  );
}
