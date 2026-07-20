export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative bg-brown pt-36 pb-16 md:pt-44 md:pb-20 overflow-hidden">
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-rose/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 w-64 h-64 rounded-full bg-cream/10 blur-3xl" />
      <div className="container-px relative text-center max-w-2xl mx-auto">
        <p className="text-rose font-semibold tracking-[0.3em] uppercase text-xs mb-3">
          {eyebrow}
        </p>
        <h1 className="font-heading text-4xl md:text-6xl text-cream leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-cream-light/80 mt-5 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
