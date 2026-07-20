import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Sign Up | Cake House" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Account" title="Create Your Account" />
      <section className="bg-cream-light py-16 md:py-20 flex justify-center">
        <SignupForm next={next} />
      </section>
    </>
  );
}
