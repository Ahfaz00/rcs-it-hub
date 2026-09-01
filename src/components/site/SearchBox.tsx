import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchSuggest } from "@/lib/discovery.functions";
import { mediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SearchBox({
  className,
  inputClassName,
  placeholder = "Search laptops, desktops, parts",
  onNavigate,
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data } = useQuery({
    queryKey: ["suggest", debounced],
    queryFn: () => searchSuggest({ data: { term: debounced } }),
    enabled: debounced.length > 1,
    staleTime: 60 * 1000,
  });

  const hasResults =
    Boolean(data) && (data!.products.length > 0 || data!.categories.length > 0 || data!.brands.length > 0);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    onNavigate?.();
    navigate({ to: "/search", search: { q } });
  }

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form onSubmit={go}>
        <div className="relative w-full min-w-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            aria-label="Search products"
            className={cn("h-10 pl-10 text-sm", inputClassName)}
          />
        </div>
      </form>

      {open && debounced.length > 1 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-lift">
          {!hasResults ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No matches. Press enter to request this product.
            </p>
          ) : (
            <>
              {data!.products.map((p) => {
                const img = mediaUrl(p.main_image_url);
                return (
                  <Link
                    key={p.id}
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    onClick={close}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {img ? <img src={img} alt="" className="h-full w-full object-contain" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatPrice(p.price, p.show_price)}
                      </span>
                    </span>
                  </Link>
                );
              })}
              {data!.categories.length ? (
                <div className="mt-1 border-t border-border pt-1">
                  {data!.categories.map((c) => (
                    <Link
                      key={c.slug}
                      to="/products"
                      search={{ category: c.slug }}
                      onClick={close}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Category · {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {data!.brands.length ? (
                <div className="mt-1 border-t border-border pt-1">
                  {data!.brands.map((b) => (
                    <Link
                      key={b.slug}
                      to="/brands/$slug"
                      params={{ slug: b.slug }}
                      onClick={close}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Brand · {b.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
