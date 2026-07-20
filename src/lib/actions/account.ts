"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: boolean } | null;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const birthday = String(formData.get("birthday") || "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, birthday: birthday || null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account/profile");
  return { success: true };
}

export async function addAddressAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const label = String(formData.get("label") || "Home").trim();
  const fullAddress = String(formData.get("fullAddress") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const pincode = String(formData.get("pincode") || "").trim();

  if (!fullAddress) return { error: "Please enter the full address." };

  const { error } = await supabase.from("addresses").insert({
    customer_id: user.id,
    label,
    full_address: fullAddress,
    city: city || null,
    pincode: pincode || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("addresses").delete().eq("id", addressId).eq("customer_id", user.id);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("addresses").update({ is_default: false }).eq("customer_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("customer_id", user.id);
  revalidatePath("/account/addresses");
}

export async function toggleWishlistAction(productId: string, isWishlisted: boolean) {
  const { supabase, user } = await requireUser();
  if (isWishlisted) {
    await supabase.from("wishlists").delete().eq("customer_id", user.id).eq("product_id", productId);
  } else {
    await supabase.from("wishlists").insert({ customer_id: user.id, product_id: productId });
  }
  revalidatePath("/account/wishlist");
}

export async function markNotificationReadAction(notificationId: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);
  revalidatePath("/account/notifications");
}
