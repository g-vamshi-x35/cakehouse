import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FiUser, FiPackage, FiMapPin, FiHeart, FiBell, FiLogOut } from "react-icons/fi";
import PageHero from "@/components/ui/PageHero";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/account/profile", label: "Profile", icon: FiUser },
  { href: "/account/orders", label: "My Orders", icon: FiPackage },
  { href: "/account/addresses", label: "Addresses", icon: FiMapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: FiHeart },
  { href: "/account/notifications", label: "Notifications", icon: FiBell },
];

export default async function AccountLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    redirect("/login?next=/account");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <>
      <PageHero eyebrow="My Account" title={`Hi, ${profile?.full_name || "there"}!`} />
      <section className="bg-cream-light py-12 md:py-16">
        <div className="container-px grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-brown bg-cream hover:bg-brown hover:text-cream-light transition-colors shrink-0"
              >
                <item.icon /> {item.label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-cream hover:bg-red-600 hover:text-white transition-colors shrink-0 w-full md:w-auto"
              >
                <FiLogOut /> Log Out
              </button>
            </form>
          </nav>
          <div>{children}</div>
        </div>
      </section>
    </>
  );
}
