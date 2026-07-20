"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type CustomCakeActionState = { error?: string; success?: boolean } | null;

export async function submitCustomCakeRequestAction(
  _prevState: CustomCakeActionState,
  formData: FormData
): Promise<CustomCakeActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Custom cake requests aren't connected yet — please message us directly on WhatsApp for now.",
    };
  }

  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const shape = String(formData.get("shape") || "").trim();
  const size = String(formData.get("size") || "").trim();
  const layers = Number(formData.get("layers")) || null;
  const flavour = String(formData.get("flavour") || "").trim();
  const creamType = String(formData.get("creamType") || "").trim();
  const theme = String(formData.get("theme") || "").trim();
  const inspirationImageUrl = String(formData.get("inspirationImageUrl") || "").trim();
  const instructions = String(formData.get("instructions") || "").trim();
  const eventDate = String(formData.get("eventDate") || "").trim();

  if (!customerName || !customerPhone) {
    return { error: "Please share your name and phone number." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("custom_cake_requests").insert({
    customer_id: user?.id ?? null,
    customer_name: customerName,
    customer_phone: customerPhone,
    shape: shape || null,
    size: size || null,
    layers,
    flavour: flavour || null,
    cream_type: creamType || null,
    theme: theme || null,
    inspiration_image_url: inspirationImageUrl || null,
    instructions: instructions || null,
    event_date: eventDate || null,
  });

  if (error) return { error: error.message };
  return { success: true };
}
