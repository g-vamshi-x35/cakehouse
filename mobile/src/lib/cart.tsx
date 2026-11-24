import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from './storage';

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  image: string | null;
  categorySlug: string;
  isCake: boolean;
  weightLabel: string | null;
  flavour: string | null;
  message: string;
  qty: number;
  /** Display price only — the database recalculates every price at checkout. */
  unitPrice: number;
};

type CartState = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hasCakes: boolean;
  add: (item: Omit<CartItem, 'key'>) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const KEY = 'cart:v1';
const CartContext = createContext<CartState | null>(null);

function itemKey(i: Omit<CartItem, 'key'>) {
  return [i.productId, i.weightLabel ?? '', i.flavour ?? '', i.message.trim()].join('|');
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readJSON<CartItem[]>(KEY, []));

  useEffect(() => {
    writeJSON(KEY, items);
  }, [items]);

  const add = useCallback((item: Omit<CartItem, 'key'>) => {
    const key = itemKey(item);
    setItems((prev) => {
      const existing = prev.find((p) => p.key === key);
      if (existing) return prev.map((p) => (p.key === key ? { ...p, qty: Math.min(50, p.qty + item.qty) } : p));
      return prev.length >= 20 ? prev : [...prev, { ...item, key }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.key === key ? { ...p, qty: Math.max(1, Math.min(50, qty)) } : p)));
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((p) => p.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartState>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
      hasCakes: items.some((i) => i.isCake),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
