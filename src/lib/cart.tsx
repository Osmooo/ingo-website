import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CONFIG } from "./config";
import { findProduct, priceOf } from "./products";

export interface CartLine {
  id: string;
  w: string;
  qty: number;
}

interface Cart {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string, w: string) => void;
  setQty: (id: string, w: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<Cart | null>(null);

function load(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem("ingo-cart") || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((l) => {
      const p = findProduct(l?.id);
      return p && p.sizes.some((s) => s.w === l.w) && Number.isInteger(l.qty) && l.qty > 0;
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("ingo-cart", JSON.stringify(lines)); } catch { /* private mode */ }
  }, [lines]);

  const add = useCallback((id: string, w: string) => {
    setLines((ls) => {
      const hit = ls.find((l) => l.id === id && l.w === w);
      return hit ? ls.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { id, w, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((id: string, w: string, qty: number) => {
    setLines((ls) =>
      qty < 1 ? ls.filter((l) => !(l.id === id && l.w === w)) : ls.map((l) => (l.id === id && l.w === w ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Cart>(() => {
    const subtotal = lines.reduce((s, l) => s + priceOf(findProduct(l.id)!, l.w) * l.qty, 0);
    const shipping = subtotal === 0 || subtotal >= CONFIG.freeShippingOver ? 0 : CONFIG.shippingFee;
    return {
      lines, open, setOpen, add, setQty, clear,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal, shipping, total: subtotal + shipping,
    };
  }, [lines, open, add, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
