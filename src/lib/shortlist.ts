import { useCallback, useEffect, useState } from "react";

export type ShortlistKind = "wishlist" | "compare";

const LIMITS: Record<ShortlistKind, number> = { wishlist: 100, compare: 4 };
const EVENT = "rcs-shortlist-change";

function storageKey(kind: ShortlistKind) {
  return `rcs:${kind}`;
}

export function readShortlist(kind: ShortlistKind): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(kind));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeShortlist(kind: ShortlistKind, ids: string[]) {
  window.localStorage.setItem(storageKey(kind), JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: kind }));
}

/** Client-only wishlist / compare list backed by localStorage. */
export function useShortlist(kind: ShortlistKind) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readShortlist(kind));
    setReady(true);
    const sync = () => setIds(readShortlist(kind));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [kind]);

  const toggle = useCallback(
    (id: string) => {
      const current = readShortlist(kind);
      let next: string[];
      let added: boolean;
      if (current.includes(id)) {
        next = current.filter((v) => v !== id);
        added = false;
      } else {
        if (current.length >= LIMITS[kind]) return { added: false, limitReached: true };
        next = [...current, id];
        added = true;
      }
      writeShortlist(kind, next);
      return { added, limitReached: false };
    },
    [kind],
  );

  const remove = useCallback(
    (id: string) => writeShortlist(kind, readShortlist(kind).filter((v) => v !== id)),
    [kind],
  );

  const clear = useCallback(() => writeShortlist(kind, []), [kind]);

  return { ids, ready, toggle, remove, clear, limit: LIMITS[kind] };
}
