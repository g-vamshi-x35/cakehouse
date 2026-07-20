import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sendEmail, birthdayEmail } from "@/lib/email";

/**
 * Daily birthday job. Schedule this to run once a day (e.g. just after
 * midnight IST) via an external scheduler — Vercel Cron, GitHub Actions,
 * cron-job.org, etc. — hitting this URL with the CRON_SECRET below.
 *
 * For each customer whose birthday is today: sends a birthday email (the
 * real automated channel today) and creates an in-app notification. True
 * automatic WhatsApp send is a later phase once a WhatsApp Business API
 * provider is connected — until then, matching customers also show up in
 * the owner dashboard's "today's birthdays" widget with a one-click
 * prefilled WhatsApp message the owner can send manually.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const { data: customers, error } = await supabase
    .from("profiles")
    .select("id, full_name, birthday")
    .eq("role", "customer")
    .not("birthday", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const todaysBirthdays = (customers ?? []).filter((c) => {
    if (!c.birthday) return false;
    const [, month, day] = c.birthday.split("-").map(Number);
    return month === todayMonth && day === todayDay;
  });

  let emailsSent = 0;
  for (const customer of todaysBirthdays) {
    await supabase.from("notifications").insert({
      user_id: customer.id,
      title: "🎂 Happy Birthday!",
      body: `Happy Birthday from all of us! Treat yourself to a cake today — order anytime on the website or WhatsApp.`,
      type: "birthday",
    });

    const { data: authUser } = await supabase.auth.admin.getUserById(customer.id);
    if (authUser?.user?.email) {
      const { subject, text } = birthdayEmail(customer.full_name || "there");
      const sent = await sendEmail({ to: authUser.user.email, subject, text });
      if (sent) emailsSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    matched: todaysBirthdays.length,
    emailsSent,
  });
}
