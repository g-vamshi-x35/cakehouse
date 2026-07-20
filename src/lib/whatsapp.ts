import { business } from "@/data/business";

export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${business.whatsappNumber}?text=${encoded}`;
}

export function orderOnWhatsAppLink(itemName: string, priceLabel?: string): string {
  const priceText = priceLabel ? ` (${priceLabel})` : "";
  const message = `Hi ${business.name}! I'd like to order: ${itemName}${priceText}.`;
  return buildWhatsAppLink(message);
}

export function cartWhatsAppLink(
  items: { name: string; qty: number; priceLabel?: string }[]
): string {
  const lines = items
    .map((item) => `- ${item.name} x${item.qty}${item.priceLabel ? ` (${item.priceLabel})` : ""}`)
    .join("\n");
  const message = `Hi ${business.name}! I'd like to order:\n${lines}`;
  return buildWhatsAppLink(message);
}
