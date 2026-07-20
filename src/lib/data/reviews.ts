import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ReviewWithAuthor = {
  id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  author_name: string;
};

type DbReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

export async function getReviewsForProduct(productId: string): Promise<ReviewWithAuthor[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, is_verified, created_at, profiles ( full_name )")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as DbReviewRow[]).map((r) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      is_verified: r.is_verified,
      created_at: r.created_at,
      author_name: profile?.full_name || "Cake House Customer",
    };
  });
}

export function averageRating(reviews: ReviewWithAuthor[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
