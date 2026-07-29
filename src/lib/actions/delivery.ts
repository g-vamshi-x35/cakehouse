"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";
import { ORDER_STATUS_LABELS } from "@/components/account/OrderStatusBadge";

async function requireDeliveryClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "delivery" && profile?.role !== "owner") throw new Error("Not authorized");

  return { supabase, user, isOwner: profile.role === "owner" };
}

// Owner can act on any order (admin override); a delivery-role user can only
// act on orders assigned to them — checked here rather than trusted from
// the client, on top of the matching RLS policy as defense in depth.
async function assertAssignedToMe(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  userId: string,
  isOwner: boolean
) {
  if (isOwner) return;
  const { data: order } = await supabase
    .from("orders")
    .select("assigned_delivery_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.assigned_delivery_id !== userId) throw new Error("Not authorized for this order");
}

function revalidateDelivery(orderId?: string) {
  revalidatePath("/dashboard/delivery");
  revalidatePath("/dashboard/delivery/orders");
  revalidatePath("/dashboard/delivery/cash");
  if (orderId) revalidatePath(`/dashboard/delivery/orders/${orderId}`);
}

export async function toggleOnlineStatusAction(isOnline: boolean) {
  const { supabase, user } = await requireDeliveryClient();
  await supabase.from("profiles").update({ is_online: isOnline }).eq("id", user.id);
  revalidatePath("/dashboard/delivery");
}

const DELIVERY_STATUSES: OrderStatus[] = ["out_for_delivery", "delivered", "cancelled"];

export async function updateDeliveryStatusAction(orderId: string, status: OrderStatus) {
  const { supabase, user, isOwner } = await requireDeliveryClient();
  if (!DELIVERY_STATUSES.includes(status)) throw new Error("Invalid status for this dashboard");
  await assertAssignedToMe(supabase, orderId, user.id, isOwner);

  const { data: order } = await supabase
    .from("orders")
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("order_number, customer_id, customer_name")
    .maybeSingle();

  if (order?.customer_id) {
    await supabase.from("notifications").insert({
      user_id: order.customer_id,
      title: `Order #${order.order_number}: ${ORDER_STATUS_LABELS[status]}`,
      body: `Your order status has been updated to "${ORDER_STATUS_LABELS[status]}".`,
      type: "order",
    });
  }

  // The owner has no other way to know a delivery finished short of
  // checking the orders list themselves — tell them directly.
  if (status === "delivered" && order) {
    const { data: owners } = await supabase.from("profiles").select("id").eq("role", "owner");
    if (owners?.length) {
      await supabase.from("notifications").insert(
        owners.map((o) => ({
          user_id: o.id,
          title: `Order #${order.order_number} delivered`,
          body: `Delivered to ${order.customer_name}.`,
          type: "order",
        }))
      );
    }
  }

  revalidateDelivery(orderId);
  revalidatePath("/dashboard/owner/orders");
  revalidatePath("/dashboard/owner/notifications");
}

export async function markCashCollectedAction(orderId: string, collected: boolean) {
  const { supabase, user, isOwner } = await requireDeliveryClient();
  await assertAssignedToMe(supabase, orderId, user.id, isOwner);

  await supabase.from("orders").update({ cash_collected: collected }).eq("id", orderId);
  revalidateDelivery(orderId);
}

export async function submitDeliveryRatingAction(orderId: string, rating: number, notes?: string) {
  const { supabase, user, isOwner } = await requireDeliveryClient();
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  await assertAssignedToMe(supabase, orderId, user.id, isOwner);

  await supabase
    .from("orders")
    .update({ delivery_rating: rating, delivery_notes: notes?.trim() || null })
    .eq("id", orderId);

  revalidateDelivery(orderId);
}
