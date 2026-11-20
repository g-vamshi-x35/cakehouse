import Link from "next/link";
import type { IconType } from "react-icons";
import { FiLogOut } from "react-icons/fi";
import { signOutAction } from "@/lib/auth/actions";

type NavItem = { href: string; label: string; icon: IconType };

/**
 * Phone/tablet navigation for the staff dashboards. The sidebar is hidden
 * below the `lg` breakpoint, so without this the owner had no way to reach
 * any dashboard page (or log out) on a phone.
 */
export default function MobileDashboardNav({ items, title }: { items: NavItem[]; title: string }) {
  return (
    <div className="lg:hidden mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-lg text-brown">{title}</p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-cream hover:bg-red-600 hover:text-white transition-colors"
          >
            <FiLogOut size={13} /> Log Out
          </button>
        </form>
      </div>
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-cream text-brown text-sm font-semibold shrink-0 hover:bg-brown hover:text-cream-light transition-colors"
          >
            <item.icon size={14} /> {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
