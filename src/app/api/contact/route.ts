import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function POST(request: Request) {
  let body: Partial<ContactPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body;

  if (!email || !subject || !message) {
    return NextResponse.json(
      { error: "Email, subject and message are required." },
      { status: 400 }
    );
  }

  let savedToDb = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: name || null,
      email,
      phone: phone || null,
      subject,
      message,
    });
    savedToDb = !error;
    if (error) console.error("Contact form: failed to save to Supabase:", error.message);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  let emailSent = false;

  if (apiKey && toEmail) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "Cake House Website <onboarding@resend.dev>",
        to: toEmail,
        replyTo: email,
        subject: `[Cake House Contact] ${subject}`,
        text: `New message from the website contact form.\n\nName: ${name || "N/A"}\nEmail: ${email}\nPhone: ${phone || "N/A"}\n\nMessage:\n${message}`,
      });
      emailSent = true;
    } catch (err) {
      console.error("Contact form send failed:", err);
    }
  }

  if (!savedToDb && !emailSent) {
    return NextResponse.json(
      {
        error:
          "This form isn't wired up yet. Please WhatsApp or call us directly for now.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
