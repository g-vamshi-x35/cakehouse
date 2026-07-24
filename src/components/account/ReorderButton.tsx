"use client";

import { FiRepeat } from "react-icons/fi";
import type { Product } from "@/data/products";
import { useQuickOrder } from "@/components/order/QuickOrderContext";

type Props = {
  product: Product;
  weightLabel?: string;
  flavour?: string;
  quantity: number;
  customMessage?: string;
};

export default function ReorderButton({ product, weightLabel, flavour, quantity, customMessage }: Props) {
  const { open } = useQuickOrder();

  return (
    <button
      onClick={() =>
        open(product, {
          weight: weightLabel,
          flavour,
          qty: quantity,
          customMessage,
        })
      }
      className="inline-flex items-center gap-2 rounded-full bg-rose text-white font-semibold px-6 py-3 hover:bg-brown transition-colors"
    >
      <FiRepeat /> Reorder
    </button>
  );
}
