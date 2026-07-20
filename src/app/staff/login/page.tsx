import type { Metadata } from "next";
import StaffLoginForm from "@/components/auth/StaffLoginForm";

export const metadata: Metadata = { title: "Staff Login | Cake House" };

export default function StaffLoginPage() {
  return (
    <section className="min-h-[80vh] bg-brown-dark flex items-center justify-center py-24 container-px">
      <StaffLoginForm />
    </section>
  );
}
