import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiGrid,
  FiBox,
  FiTag,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiUserCheck,
  FiPercent,
  FiBarChart2,
  FiSettings,
  FiMail,
  FiCreditCard,
  FiActivity,
  FiLogOut,
  FiEdit3,
} from "react-icons/fi";
import { requireRole } from "@/lib/auth/guards";
import { signOutAction } from "@/lib/auth/actions";

const NAV = [
  { href: "/dashboard/owner", label: "Overview", icon: FiGrid },
  { href: "/dashboard/owner/orders", label: "Orders", icon: FiShoppingBag },
  { href: "/dashboard/owner/products", label: "Products", icon: FiBox },
  { href: "/dashboard/owner/categories", label: "Categories", icon: FiTag },
  { href: "/dashboard/owner/custom-cakes", label: "Custom Cakes", icon: FiEdit3 },
  { href: "/dashboard/owner/inventory", label: "Inventory", icon: FiPackage },
  { href: "/dashboard/owner/customers", label: "Customers", icon: FiUsers },
  { href: "/dashboard/owner/employees", label: "Employees", icon: FiUserCheck },
  { href: "/dashboard/owner/coupons", label: "Coupons", icon: FiPercent },
  { href: "/dashboard/owner/analytics", label: "Analytics", icon: FiBarChart2 },
  { href: "/dashboard/owner/payments", label: "Payments", icon: FiCreditCard },
  { href: "/dashboard/owner/messages", label: "Messages", icon: FiMail },
  { href: "/dashboard/owner/settings", label: "Settings", icon: FiSettings },
  { href: "/dashboard/owner/activity", label: "Activity Log", icon: FiActivity },
];

export default async function OwnerDashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole(["owner"]);

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
            <p className="text-[11px] text-cream-light/50">Owner Dashboard</p>
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
          <p className="px-3 text-xs text-cream-light/50 mb-2">{profile?.full_name || "Owner"}</p>
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

      <main className="flex-1 min-w-0 p-5 md:p-8">{children}</main>
    </div>
  );
}
