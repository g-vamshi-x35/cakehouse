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
import type { Product } from "@/data/products";

export type QuickOrderSavedInfo = {
  name: string;
  phone: string;
  address: string;
  deliveryInstructions: string;
};

export type QuickOrderInitialSelection = {
  weight?: string;
  flavour?: string;
  qty?: number;
  customMessage?: string;
  eventDate?: string;
  eventTime?: string;
};

type QuickOrderContextValue = {
  savedInfo: QuickOrderSavedInfo;
  hydrated: boolean;
  openProduct: Product | null;
  initialSelection: QuickOrderInitialSelection | null;
  open: (product: Product, initialSelection?: QuickOrderInitialSelection) => void;
  close: () => void;
  setSavedInfo: (info: Partial<QuickOrderSavedInfo>) => void;
};

const QuickOrderContext = createContext<QuickOrderContextValue | null>(null);

const EMPTY_SAVED_INFO: QuickOrderSavedInfo = {
  name: "",
  phone: "",
  address: "",
  deliveryInstructions: "",
};

const STORAGE_KEY = "cakehouse:quickorder:v1";

export function QuickOrderProvider({ children }: { children: ReactNode }) {
  const [savedInfo, setSavedInfoState] = useState<QuickOrderSavedInfo>(EMPTY_SAVED_INFO);
  const [hydrated, setHydrated] = useState(false);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [initialSelection, setInitialSelection] = useState<QuickOrderInitialSelection | null>(null);

  // Restore saved name/phone/address after mount — same one-time external-storage
  // sync pattern the old cart context used, so returning customers still get
  // their details prefilled without needing a persistent cart.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<QuickOrderSavedInfo>;
        setSavedInfoState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // corrupted/unavailable storage — ignore and start fresh
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedInfo));
    } catch {
      // storage full/unavailable — non-fatal
    }
  }, [savedInfo, hydrated]);

  const open = useCallback((product: Product, selection?: QuickOrderInitialSelection) => {
    setOpenProduct(product);
    setInitialSelection(selection ?? null);
  }, []);

  const close = useCallback(() => {
    setOpenProduct(null);
    setInitialSelection(null);
  }, []);

  const setSavedInfo = useCallback((info: Partial<QuickOrderSavedInfo>) => {
    setSavedInfoState((prev) => ({ ...prev, ...info }));
  }, []);

  const value = useMemo(
    () => ({ savedInfo, hydrated, openProduct, initialSelection, open, close, setSavedInfo }),
    [savedInfo, hydrated, openProduct, initialSelection, open, close, setSavedInfo]
  );

  return <QuickOrderContext.Provider value={value}>{children}</QuickOrderContext.Provider>;
}

export function useQuickOrder() {
  const ctx = useContext(QuickOrderContext);
  if (!ctx) throw new Error("useQuickOrder must be used within QuickOrderProvider");
  return ctx;
}
