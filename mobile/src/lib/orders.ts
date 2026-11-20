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
