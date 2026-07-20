"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  image?: string;
  unitPrice: number;
  qty: number;
  weightLabel?: string;
  flavour?: string;
  customMessage?: string;
  eventDate?: string;
  eventTime?: string;
};

export type CheckoutInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  deliveryInstructions: string;
};

type AddItemInput = Omit<CartItem, "lineId" | "qty"> & { qty?: number };

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  checkoutInfo: CheckoutInfo;
  hydrated: boolean;
  addItem: (item: AddItemInput) => void;
  removeItem: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setCheckoutInfo: (info: Partial<CheckoutInfo>) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CHECKOUT_INFO: CheckoutInfo = {
  name: "",
  phone: "",
  email: "",
  address: "",
  deliveryInstructions: "",
};

const STORAGE_KEY = "cakehouse:cart:v1";

function lineSignature(item: AddItemInput): string {
  return [
    item.productId,
    item.weightLabel ?? "",
    item.flavour ?? "",
    item.customMessage ?? "",
    item.eventDate ?? "",
    item.eventTime ?? "",
  ].join("::");
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutInfo, setCheckoutInfoState] = useState<CheckoutInfo>(EMPTY_CHECKOUT_INFO);
  const [hydrated, setHydrated] = useState(false);

  // Restore from localStorage after mount. This is a one-time sync from an
  // external system (browser storage) that can't be read during SSR/render
  // without a hydration mismatch, so an effect is the correct tool here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: CartItem[]; checkoutInfo?: CheckoutInfo };
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.checkoutInfo) setCheckoutInfoState((prev) => ({ ...prev, ...parsed.checkoutInfo }));
      }
    } catch {
      // corrupted/unavailable storage — ignore and start fresh
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on every change, once initial hydration has happened.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, checkoutInfo }));
    } catch {
      // storage full/unavailable — non-fatal
    }
  }, [items, checkoutInfo, hydrated]);

  const addItem = useCallback((item: AddItemInput) => {
    const signature = lineSignature(item);
    setItems((prev) => {
      const existing = prev.find((i) => lineSignature(i) === signature);
      if (existing) {
        return prev.map((i) =>
          i.lineId === existing.lineId ? { ...i, qty: i.qty + (item.qty ?? 1) } : i
        );
      }
      return [...prev, { ...item, lineId: generateId(), qty: item.qty ?? 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateQty = useCallback((lineId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const setCheckoutInfo = useCallback((info: Partial<CheckoutInfo>) => {
    setCheckoutInfoState((prev) => ({ ...prev, ...info }));
  }, []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      count,
      subtotal,
      checkoutInfo,
      hydrated,
      addItem,
      removeItem,
      updateQty,
      clear,
      open,
      close,
      setCheckoutInfo,
    }),
    [items, isOpen, count, subtotal, checkoutInfo, hydrated, addItem, removeItem, updateQty, clear, open, close, setCheckoutInfo]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
