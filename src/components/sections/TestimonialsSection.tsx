import Link from "next/link";
import SectionReveal from "@/components/ui/SectionReveal";
import StarRating from "@/components/ui/StarRating";
import { getFeaturedReviews } from "@/lib/data/reviews";

export default async function TestimonialsSection() {
  const reviews = await getFeaturedReviews(6);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream-light py-20 md:py-28">
      <div className="container-px">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-3">
            Customer Reviews
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-brown">What Our Customers Say</h2>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <SectionReveal key={review.id} delay={(i % 3) * 0.08}>
              <div className="bg-cream rounded-3xl p-6 h-full flex flex-col">
                <StarRating rating={review.rating} size={14} />
                {review.comment && (
                  <p className="text-sm text-ink/70 leading-relaxed mt-3 flex-1">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-brown/10">
                  <div>
                    <p className="text-sm font-semibold text-brown">{review.author_name}</p>
                    {review.product_slug && (
                      <Link
                        href={`/menu/${review.product_slug}`}
                        className="text-xs text-ink/50 hover:text-rose transition-colors"
                      >
                        {review.product_name}
                      </Link>
                    )}
                  </div>
                  {review.is_verified && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
