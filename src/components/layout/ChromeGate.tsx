"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import SmoothScrollProvider from "./SmoothScrollProvider";
import QuickOrderModal from "@/components/order/QuickOrderModal";

// Routes that render their own complete layout (dashboard sidebar shells,
// the staff login screen) and must never get the public marketing site's
// fixed Header/Footer, loading-screen animation, or Lenis/GSAP smooth
// scroll — those were rendering unconditionally on every route, which both
// visually collided with the dashboard sidebars and cost every dashboard
// page an unused animation loop.
const BARE_PREFIXES = ["/dashboard", "/staff"];

export default function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBare = BARE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <>
      <LoadingScreen />
      <SmoothScrollProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </SmoothScrollProvider>
      <QuickOrderModal />
    </>
  );
}
