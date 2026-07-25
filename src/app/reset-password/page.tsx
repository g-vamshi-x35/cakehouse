import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Set New Password | Cake House" };

export default function ResetPasswordPage() {
  return (
    <>
      <PageHero eyebrow="Account" title="Set New Password" />
      <section className="bg-cream-light py-16 md:py-20 flex justify-center">
        <ResetPasswordForm />
      </section>
    </>
  );
}
