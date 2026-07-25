import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset Password | Cake House" };

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero eyebrow="Account" title="Reset Password" />
      <section className="bg-cream-light py-16 md:py-20 flex justify-center">
        <ForgotPasswordForm />
      </section>
    </>
  );
}
