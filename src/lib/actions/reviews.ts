"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ReviewActionState = { error?: string; success?: boolean } | null;

export async function submitReviewAction(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Reviews aren't connected yet — please check back soon." };
  }

  const productId = String(formData.get("productId") || "");
  const productSlug = String(formData.get("productSlug") || "");
  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "").trim();

  if (!productId || rating < 1 || rating > 5) {
    return { error: "Please choose a rating between 1 and 5 stars." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to leave a review." };
  }

  const { count } = await supabase
    .from("order_items")
    .select("id, orders!inner(customer_id, order_status)", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("orders.customer_id", user.id)
    .eq("orders.order_status", "delivered");

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    customer_id: user.id,
    rating,
    comment: comment || null,
    is_verified: Boolean(count && count > 0),
  });

  if (error) return { error: error.message };

  if (productSlug) revalidatePath(`/menu/${productSlug}`);
  return { success: true };
}
