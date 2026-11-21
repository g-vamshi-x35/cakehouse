import { supabase } from './supabase';

export type OrderStatus = 'pending' | 'confirmed' | 'baking' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'advance_pending' | 'advance_paid' | 'paid_full' | 'refunded';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  baking: 'Baking',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  advance_pending: 'Advance Pending',
  advance_paid: 'Advance Paid',
  paid_full: 'Paid in Full',
  refunded: 'Refunded',
};

/** Customer-facing progress steps (cancelled is shown separately). */
export const PROGRESS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'pending', label: 'Order placed', hint: 'We’ve received your order' },
  { status: 'confirmed', label: 'Confirmed', hint: 'Advance received, order confirmed' },
  { status: 'baking', label: 'Baking', hint: 'Freshly baking in our kitchen' },
  { status: 'ready', label: 'Ready', hint: 'Packed and ready to go' },
  { status: 'out_for_delivery', label: 'Out for delivery', hint: 'On the way to you' },
  { status: 'delivered', label: 'Delivered', hint: 'Enjoy every bite!' },
];

/** Statuses each staff role may set (matches the database rules). */
export const STATUS_STEPS: Record<'owner' | 'employee' | 'delivery', OrderStatus[]> = {
  owner: ['pending', 'confirmed', 'baking', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
  employee: ['pending', 'confirmed', 'baking', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
  delivery: ['out_for_delivery', 'delivered', 'cancelled'],
};

export function formatDate(d: string | null | undefined) {
  if (!d) return '';
  const dt = new Date(d.length === 10 ? `${d}T00:00:00` : d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(t: string | null | undefined) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export type OrderSummary = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  event_date: string | null;
  event_time: string | null;
  created_at: string;
  order_items?: { product_name: string; quantity: number }[];
};

export async function fetchMyOrders(userId: string): Promise<OrderSummary[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total, order_status, payment_status, event_date, event_time, created_at, order_items ( product_name, quantity )')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as OrderSummary[] | null) ?? [];
}

export type OrderDetail = OrderSummary & {
  customer_phone: string;
  delivery_address: string;
  delivery_instructions: string | null;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  advance_amount: number;
  payment_method: string;
  items: {
    product_id: string | null;
    product_name: string;
    weight_label: string | null;
    flavour: string | null;
    custom_message: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

export async function fetchOrder(id: string): Promise<OrderDetail | null> {
  const [{ data: o, error }, { data: items }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('order_items')
      .select('product_id, product_name, weight_label, flavour, custom_message, quantity, unit_price, line_total')
      .eq('order_id', id),
  ]);
  if (error) throw error;
  if (!o) return null;
  return { ...(o as OrderDetail), items: (items as OrderDetail['items'] | null) ?? [] };
}

export type CustomRequestStatus = 'pending' | 'quoted' | 'approved' | 'rejected' | 'converted';
export const REQUEST_STATUS_LABEL: Record<CustomRequestStatus, string> = {
  pending: 'Under review',
  quoted: 'Quote ready',
  approved: 'Approved',
  rejected: 'Not possible',
  converted: 'Order created',
};
