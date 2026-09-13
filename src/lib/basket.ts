import { useCallback, useEffect, useState } from "react";

export type BasketItem = {
  id: string;
  name: string;
  slug: string;
  qty: number;
};

const KEY = "rcs:enquiry-basket";
const EVENT = "rcs-basket-change";
export const BASKET_LIMIT = 20;

export function readBasket(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is BasketItem => {
        const o = v as Partial<BasketItem> | null;
        return !!o && typeof o.id === "string" && typeof o.name === "string" && typeof o.slug === "string";
      })
      .map((v) => ({ ...v, qty: Number.isFinite(v.qty) && v.qty > 0 ? Math.floor(v.qty) : 1 }));
  } catch {
    return [];
  }
}

function writeBasket(items: BasketItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Client-only multi-product enquiry basket backed by localStorage. */
export function useEnquiryBasket() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readBasket());
    setReady(true);
    const sync = () => setItems(readBasket());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((item: Omit<BasketItem, "qty">, qty = 1) => {
    const current = readBasket();
    const existing = current.find((i) => i.id === item.id);
    if (existing) {
      writeBasket(current.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i)));
      return { added: true, limitReached: false };
    }
    if (current.length >= BASKET_LIMIT) return { added: false, limitReached: true };
    writeBasket([...current, { ...item, qty: Math.max(1, qty) }]);
    return { added: true, limitReached: false };
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    const safe = Math.min(9999, Math.max(1, Math.floor(qty) || 1));
    writeBasket(readBasket().map((i) => (i.id === id ? { ...i, qty: safe } : i)));
  }, []);

  const remove = useCallback((id: string) => {
    writeBasket(readBasket().filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => writeBasket([]), []);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  return { items, ready, add, setQty, remove, clear, has, limit: BASKET_LIMIT };
}

/** Plain-ASCII WhatsApp message listing every basket item. */
export function basketMessage(items: BasketItem[]) {
  const lines = items.map((i, n) => `${n + 1}. ${i.name} - Qty: ${i.qty}`);
  return [
    "Hi R Computer Solutions, I am visiting from your website and I would like a combined quote for the following items:",
    "",
    ...lines,
    "",
    "Please share the latest price, availability and condition details. Thank you!",
  ].join("\n");
}
