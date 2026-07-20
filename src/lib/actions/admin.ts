"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types";
import { ORDER_STATUS_LABELS } from "@/components/account/OrderStatusBadge";

export type ActionState = { error?: string; success?: boolean } | null;

async function requireOwnerClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner") throw new Error("Not authorized");
  return { supabase, user };
}

async function requireStaffClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner" && profile?.role !== "employee") throw new Error("Not authorized");
  return { supabase, user, role: profile.role };
}

async function logActivity(action: string, entityType?: string, entityId?: string) {
  const { supabase, user } = await requireStaffClient();
  await supabase.from("activity_log").insert({ actor_id: user.id, action, entity_type: entityType, entity_id: entityId });
}

// ---------- Products ----------

export async function saveProductAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwnerClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/\s+/g, "-");
  const categoryId = String(formData.get("categoryId") || "");
  const description = String(formData.get("description") || "").trim();
  const ingredients = String(formData.get("ingredients") || "").trim();
  const price500 = Number(formData.get("price500")) || null;
  const price1000 = Number(formData.get("price1000")) || null;
  const basePrice = Number(formData.get("basePrice")) || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "on";
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  if (!name || !slug) return { error: "Name and slug are required." };

  const payload = {
    name,
    slug,
    category_id: categoryId || null,
    description,
    ingredients,
    price_500: price500,
    price_1000: price1000,
    base_price: basePrice,
    is_featured: isFeatured,
    is_active: isActive,
  };

  let productId = id;
  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) return { error: error.message };
    productId = data.id;
  }

  if (imageUrl) {
    await supabase.from("product_images").insert({ product_id: productId, url: imageUrl, sort_order: 0 });
  }

  await logActivity(id ? "Updated product" : "Created product", "product", productId);
  revalidatePath("/dashboard/owner/products");
  redirect("/dashboard/owner/products");
}

export async function deleteProductAction(productId: string) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("products").delete().eq("id", productId);
  await logActivity("Deleted product", "product", productId);
  revalidatePath("/dashboard/owner/products");
}

// ---------- Categories ----------

export async function addCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwnerClient();
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/\s+/g, "-");
  if (!name || !slug) return { error: "Name and slug are required." };

  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/owner/categories");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/dashboard/owner/categories");
}

// ---------- Inventory ----------

export async function addInventoryItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireStaffClient();
  const name = String(formData.get("name") || "").trim();
  const unit = String(formData.get("unit") || "kg").trim();
  const quantity = Number(formData.get("quantity")) || 0;
  const lowStockThreshold = Number(formData.get("lowStockThreshold")) || 5;
  if (!name) return { error: "Item name is required." };

  const { error } = await supabase
    .from("inventory_items")
    .insert({ name, unit, quantity, low_stock_threshold: lowStockThreshold });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/owner/inventory");
  revalidatePath("/dashboard/employee/inventory");
  return { success: true };
}

export async function updateInventoryQtyAction(itemId: string, quantity: number) {
  const { supabase } = await requireStaffClient();
  await supabase.from("inventory_items").update({ quantity, updated_at: new Date().toISOString() }).eq("id", itemId);
  revalidatePath("/dashboard/owner/inventory");
  revalidatePath("/dashboard/employee/inventory");
}

export async function deleteInventoryItemAction(itemId: string) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("inventory_items").delete().eq("id", itemId);
  revalidatePath("/dashboard/owner/inventory");
}

// ---------- Orders ----------

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const { supabase } = await requireStaffClient();
  const { data: order } = await supabase
    .from("orders")
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("order_number, customer_id")
    .maybeSingle();

  if (order?.customer_id) {
    await supabase.from("notifications").insert({
      user_id: order.customer_id,
      title: `Order #${order.order_number}: ${ORDER_STATUS_LABELS[status]}`,
      body: `Your order status has been updated to "${ORDER_STATUS_LABELS[status]}".`,
      type: "order",
    });
  }

  await logActivity(`Order status → ${status}`, "order", orderId);
  revalidatePath("/dashboard/owner/orders");
  revalidatePath("/dashboard/employee/orders");
  revalidatePath(`/dashboard/owner/orders/${orderId}`);
}

export async function confirmAdvancePaymentAction(orderId: string) {
  const { supabase } = await requireStaffClient();
  const { data: order } = await supabase
    .from("orders")
    .update({ payment_status: "advance_paid" as PaymentStatus, order_status: "confirmed" })
    .eq("id", orderId)
    .select("order_number, customer_id, advance_amount")
    .maybeSingle();

  if (order?.customer_id) {
    await supabase.from("notifications").insert({
      user_id: order.customer_id,
      title: `Payment confirmed for #${order.order_number}`,
      body: `We've confirmed your advance payment of ₹${order.advance_amount}. Thank you!`,
      type: "payment",
    });
  }

  await logActivity("Confirmed advance payment", "order", orderId);
  revalidatePath("/dashboard/owner/orders");
  revalidatePath(`/dashboard/owner/orders/${orderId}`);
}

export async function assignEmployeeAction(orderId: string, employeeId: string) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("orders").update({ assigned_employee_id: employeeId || null }).eq("id", orderId);
  revalidatePath("/dashboard/owner/orders");
  revalidatePath(`/dashboard/owner/orders/${orderId}`);
}

// ---------- Coupons ----------

export async function addCouponAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwnerClient();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const discountType = String(formData.get("discountType") || "flat") as "flat" | "percent";
  const discountValue = Number(formData.get("discountValue")) || 0;
  const minOrderAmount = Number(formData.get("minOrderAmount")) || 0;
  const maxUses = Number(formData.get("maxUses")) || null;

  if (!code || discountValue <= 0) return { error: "Please provide a code and a discount value." };

  const { error } = await supabase.from("coupons").insert({
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrderAmount,
    max_uses: maxUses,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/owner/coupons");
  return { success: true };
}

export async function toggleCouponActiveAction(couponId: string, active: boolean) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("coupons").update({ active: !active }).eq("id", couponId);
  revalidatePath("/dashboard/owner/coupons");
}

// ---------- Employees ----------

export async function inviteEmployeeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOwnerClient();

  const email = String(formData.get("email") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "employee") as "employee" | "owner";

  if (!email || password.length < 6) {
    return { error: "Provide an email and a password of at least 6 characters." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone },
  });

  if (error || !data.user) return { error: error?.message || "Could not create the account." };

  await admin.from("profiles").update({ role, full_name: fullName, phone }).eq("id", data.user.id);

  revalidatePath("/dashboard/owner/employees");
  return { success: true };
}

export async function removeEmployeeAction(employeeId: string) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("profiles").update({ role: "customer" }).eq("id", employeeId);
  revalidatePath("/dashboard/owner/employees");
}

// ---------- Banners & Settings ----------

export async function addBannerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwnerClient();
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const linkUrl = String(formData.get("linkUrl") || "").trim();

  if (!imageUrl) return { error: "Please provide an image URL." };

  const { error } = await supabase.from("banners").insert({
    title,
    subtitle,
    image_url: imageUrl,
    link_url: linkUrl || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/owner/settings");
  return { success: true };
}

export async function toggleBannerActiveAction(bannerId: string, active: boolean) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("banners").update({ is_active: !active }).eq("id", bannerId);
  revalidatePath("/dashboard/owner/settings");
}

export async function deleteBannerAction(bannerId: string) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("banners").delete().eq("id", bannerId);
  revalidatePath("/dashboard/owner/settings");
}

export async function updateSiteSettingAction(key: string, value: string) {
  const { supabase } = await requireOwnerClient();
  await supabase.from("site_settings").upsert({ key, value: { text: value } });
  revalidatePath("/dashboard/owner/settings");
}

// ---------- Contact messages ----------

export async function markMessageReadAction(messageId: string) {
  const { supabase } = await requireStaffClient();
  await supabase.from("contact_messages").update({ is_read: true }).eq("id", messageId);
  revalidatePath("/dashboard/owner/messages");
}

// ---------- Custom cake requests ----------

export async function quoteCustomCakeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireOwnerClient();
  const requestId = String(formData.get("requestId") || "");
  const quotedPrice = Number(formData.get("quotedPrice")) || 0;
  const ownerNotes = String(formData.get("ownerNotes") || "").trim();

  if (!quotedPrice) return { error: "Please enter a quoted price." };

  const { error } = await supabase
    .from("custom_cake_requests")
    .update({ quoted_price: quotedPrice, owner_notes: ownerNotes, status: "quoted" })
    .eq("id", requestId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/owner/custom-cakes");
  return { success: true };
}

export async function updateCustomCakeStatusAction(requestId: string, status: "approved" | "rejected") {
  const { supabase } = await requireOwnerClient();
  await supabase.from("custom_cake_requests").update({ status }).eq("id", requestId);
  revalidatePath("/dashboard/owner/custom-cakes");
}
