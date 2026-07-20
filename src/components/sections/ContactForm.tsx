"use client";

import { useState, type FormEvent } from "react";
import { FiSend } from "react-icons/fi";

type Status = "idle" | "loading" | "success" | "error";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send message.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-cream rounded-3xl p-8 text-center">
        <p className="text-3xl mb-3">🎉</p>
        <h3 className="font-heading text-2xl text-brown mb-2">Message Sent!</h3>
        <p className="text-ink/70">
          Thanks for reaching out — we&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream rounded-3xl p-8 space-y-4">
      <div>
        <label htmlFor="name" className="sr-only">
          Full Name
        </label>
        <input id="name" name="name" type="text" placeholder="Full Name" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email Address *"
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="phone" className="sr-only">
          Phone Number
        </label>
        <input id="phone" name="phone" type="tel" placeholder="Phone Number" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="subject" className="sr-only">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="Subject *"
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Message"
          className={`${inputClasses} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Message"} <FiSend size={16} />
      </button>
    </form>
  );
}
