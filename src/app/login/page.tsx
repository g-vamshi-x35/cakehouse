import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log In | Cake House" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Account" title="Log In" />
      <section className="bg-cream-light py-16 md:py-20 flex justify-center">
        <LoginForm next={next} />
      </section>
    </>
  );
}
