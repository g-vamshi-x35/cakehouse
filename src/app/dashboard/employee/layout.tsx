import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiGrid, FiShoppingBag, FiPackage, FiBell, FiLogOut } from "react-icons/fi";
import { requireRole } from "@/lib/auth/guards";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/dashboard/employee", label: "Today", icon: FiGrid },
  { href: "/dashboard/employee/orders", label: "Orders", icon: FiShoppingBag },
  { href: "/dashboard/employee/inventory", label: "Inventory", icon: FiPackage },
  { href: "/dashboard/employee/notifications", label: "Notifications", icon: FiBell },
];

export default async function EmployeeDashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole(["employee", "owner"]);

  return (
    <div className="min-h-screen bg-cream-light flex">
      <aside className="hidden lg:flex w-64 shrink-0 bg-brown-dark text-cream-light flex-col">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image
            src="/images/brand/logo-circle.jpg"
            alt="Cake House logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-heading text-lg leading-none">Cake House</p>
            <p className="text-[11px] text-cream-light/50">Employee Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-cream-light/80 hover:bg-cream-light/10 hover:text-cream transition-colors"
            >
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-cream-light/10">
          <p className="px-3 text-xs text-cream-light/50 mb-2">{profile?.full_name || "Employee"}</p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <FiLogOut size={16} /> Log Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 md:p-8">
        <div className="lg:hidden flex items-center gap-4 mb-6 overflow-x-auto pb-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-cream text-brown text-sm font-semibold shrink-0"
            >
              <item.icon size={14} /> {item.label}
            </Link>
          ))}
        </div>
        {children}
      </main>
    </div>
  );
}
