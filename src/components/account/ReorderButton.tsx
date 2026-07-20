"use client";

import { useRouter } from "next/navigation";
import { FiRepeat } from "react-icons/fi";
import { useCart } from "@/components/cart/CartContext";

type ReorderItem = {
  product_id: string | null;
  product_name: string;
  weight_label: string | null;
  flavour: string | null;
  custom_message: string | null;
  quantity: number;
  unit_price: number;
};

export default function ReorderButton({ items }: { items: ReorderItem[] }) {
  const router = useRouter();
  const { addItem } = useCart();

  function handleReorder() {
    items.forEach((item) => {
      if (!item.product_id) return;
      addItem({
        productId: item.product_id,
        name: item.product_name,
        unitPrice: item.unit_price,
        qty: item.quantity,
        weightLabel: item.weight_label ?? undefined,
        flavour: item.flavour ?? undefined,
        customMessage: item.custom_message ?? undefined,
      });
    });
    router.push("/checkout");
  }

  return (
    <button
      onClick={handleReorder}
      className="inline-flex items-center gap-2 rounded-full bg-rose text-white font-semibold px-6 py-3 hover:bg-brown transition-colors"
    >
      <FiRepeat /> Reorder
    </button>
  );
}
