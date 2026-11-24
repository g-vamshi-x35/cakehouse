/** "₹1,200 per kg" — or null when the owner hasn't set a price. Safe on server and client. */
export function formatPremiumPrice(price: number | null, label: string | null) {
  if (price == null) return null;
  return `₹${price.toLocaleString("en-IN")}${label ? ` ${label}` : ""}`;
}
