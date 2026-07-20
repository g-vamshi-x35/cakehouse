import SectionReveal from "@/components/ui/SectionReveal";
import StarRating from "@/components/ui/StarRating";
import ReviewForm from "@/components/product/ReviewForm";
import { getReviewsForProduct, averageRating } from "@/lib/data/reviews";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProductReviews({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const reviews = await getReviewsForProduct(productId);
  const avg = averageRating(reviews);

  let isLoggedIn = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
  }

  return (
    <section className="bg-cream-light py-16 md:py-20">
      <div className="container-px max-w-3xl mx-auto">
        <SectionReveal className="mb-8">
          <p className="text-rose font-semibold tracking-[0.25em] uppercase text-xs mb-2">
            Customer Reviews
          </p>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl md:text-4xl text-brown">Ratings &amp; Reviews</h2>
            {avg != null && (
              <span className="flex items-center gap-2 text-ink/70 text-sm">
                <StarRating rating={avg} /> {avg} ({reviews.length})
              </span>
            )}
          </div>
        </SectionReveal>

        <SectionReveal delay={0.05} className="mb-8">
          <ReviewForm productId={productId} productSlug={productSlug} isLoggedIn={isLoggedIn} />
        </SectionReveal>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink/50">
              No reviews yet — be the first to share your experience!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-cream rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size={13} />
                    <span className="text-sm font-semibold text-brown">{review.author_name}</span>
                    {review.is_verified && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-ink/40">
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && <p className="text-sm text-ink/70 mt-2">{review.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
