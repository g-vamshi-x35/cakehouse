import { business } from "@/data/business";

export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${business.whatsappNumber}?text=${encoded}`;
}

/** Deep-link for the *owner/staff* to message a specific customer (not the shop's own number). */
export function buildWhatsAppLinkToNumber(phone: string, message: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  const withCountryCode = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppOrderConfig = {
  name: string;
  weightLabel?: string;
  flavour?: string;
  qty?: number;
  priceLabel?: string;
  customMessage?: string;
  eventDate?: string;
  eventTime?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  deliveryInstructions?: string;
};

function formatConfigLines(item: WhatsAppOrderConfig): string[] {
  const lines: string[] = [];
  if (item.weightLabel) lines.push(`  Weight: ${item.weightLabel}`);
  if (item.flavour) lines.push(`  Flavour: ${item.flavour}`);
  if (item.customMessage) lines.push(`  Message on cake: "${item.customMessage}"`);
  if (item.eventDate) lines.push(`  Needed on: ${item.eventDate}${item.eventTime ? ` at ${item.eventTime}` : ""}`);
  return lines;
}

export function orderOnWhatsAppLink(item: WhatsAppOrderConfig): string {
  const qtyText = item.qty && item.qty > 1 ? ` x${item.qty}` : "";
  const priceText = item.priceLabel ? ` (${item.priceLabel})` : "";
  const lines = [
    `Hi ${business.name}! I'd like to order:`,
    `- ${item.name}${qtyText}${priceText}`,
    ...formatConfigLines(item),
  ];

  if (item.customerName) lines.push(`\nName: ${item.customerName}`);
  if (item.phone) lines.push(`Phone: ${item.phone}`);
  if (item.address) lines.push(`Delivery Address: ${item.address}`);
  if (item.deliveryInstructions) lines.push(`Delivery Instructions: ${item.deliveryInstructions}`);

  return buildWhatsAppLink(lines.join("\n"));
}

export function cartWhatsAppLink(
  items: WhatsAppOrderConfig[],
  checkout?: { name?: string; phone?: string; address?: string; deliveryInstructions?: string }
): string {
  const itemLines = items.flatMap((item) => {
    const qtyText = item.qty && item.qty > 1 ? ` x${item.qty}` : "";
    const priceText = item.priceLabel ? ` (${item.priceLabel})` : "";
    return [`- ${item.name}${qtyText}${priceText}`, ...formatConfigLines(item)];
  });

  const lines = [`Hi ${business.name}! I'd like to order:`, ...itemLines];

  if (checkout?.name) lines.push(`\nName: ${checkout.name}`);
  if (checkout?.phone) lines.push(`Phone: ${checkout.phone}`);
  if (checkout?.address) lines.push(`Delivery Address: ${checkout.address}`);
  if (checkout?.deliveryInstructions) lines.push(`Delivery Instructions: ${checkout.deliveryInstructions}`);

  return buildWhatsAppLink(lines.join("\n"));
}
