import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MessageCircle, Search } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listStockSheet } from "@/lib/public.functions";
import { siteQueryOptions, whatsappLink } from "@/lib/site-query";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const stockQueryOptions = queryOptions({
  queryKey: ["stock-sheet"],
  queryFn: () => listStockSheet(),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/stock-sheet")({
  loader: ({ context }) => context.queryClient.ensureQueryData(stockQueryOptions),
  head: () => ({
    meta: [
      { title: "Live Wholesale Stock Sheet | R Computer Solutions" },
      {
        name: "description",
        content:
          "Dealer stock sheet of available refurbished laptops, desktops, workstations, Intel processors and RAM lots. Search by model and request wholesale pricing on WhatsApp.",
      },
      { property: "og:title", content: "Live Wholesale Stock Sheet | R Computer Solutions" },
      {
        property: "og:description",
        content:
          "Compact dealer view of current refurbished IT hardware stock with specs, condition and quantity. Contact for wholesale price.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://rcs-it-hub.lovable.app/stock-sheet" },
    ],
    links: [{ rel: "canonical", href: "https://rcs-it-hub.lovable.app/stock-sheet" }],
  }),
  component: StockSheetPage,
  errorComponent: () => (
    <SiteShell>
      <PageHero title="Stock sheet" subtitle="We could not load the stock sheet right now. Please try again." />
    </SiteShell>
  ),
  notFoundComponent: () => (
    <SiteShell>
      <PageHero title="Stock sheet" subtitle="Page not found." />
    </SiteShell>
  ),
});

function StockSheetPage() {
  const { data } = useSuspenseQuery(stockQueryOptions);
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const [term, setTerm] = useState("");
  const [tab, setTab] = useState("all");
  const wa = site.settings["whatsapp"];

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of data.products) {
      if (p.categories?.slug) map.set(p.categories.slug, p.categories.name);
    }
    return [...map.entries()];
  }, [data.products]);

  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    return data.products.filter((p) => {
      if (tab !== "all" && p.categories?.slug !== tab) return false;
      if (!q) return true;
      return [p.name, p.sku, p.processor_model, p.ram, p.storage_capacity, p.brands?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data.products, term, tab]);

  const specOf = (p: (typeof data.products)[number]) =>
    [p.processor_model, p.ram, p.storage_capacity, p.display_size].filter(Boolean).join(" · ") || "—";

  return (
    <SiteShell>
      <PageHero
        title="Live wholesale stock sheet"
        subtitle="Current availability for dealers, resellers and corporate buyers. Prices shared on enquiry."
        breadcrumb="Stock sheet"
      />

      <section className="container-page section-y-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              aria-label="Search stock sheet"
              placeholder="Search model, processor, RAM, SKU…"
              className="h-12 rounded-full pl-11"
            />
          </div>
          {wa ? (
            <Button
              asChild
              className="h-12 shrink-0 rounded-full bg-success text-[0.72rem] font-bold uppercase tracking-[0.12em] text-success-foreground hover:bg-success/90"
            >
              <a
                href={whatsappLink(
                  wa,
                  "Hi R Computer Solutions, please share your latest wholesale stock sheet with prices. Thank you!",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Request full sheet
              </a>
            </Button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[["all", "All stock"] as [string, string], ...categories].map(([slug, name]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setTab(slug)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.78rem] font-semibold transition-colors",
                tab === slug
                  ? "border-navy bg-navy text-navy-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <p className="mt-4 text-[0.8rem] text-muted-foreground">{rows.length} items listed</p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[46rem] border-collapse text-left text-[0.85rem]">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">Specs</th>
                <th className="px-4 py-3 font-semibold">Condition</th>
                <th className="px-4 py-3 font-semibold">Availability</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rows.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link to="/products/$slug" params={{ slug: p.slug }} className="font-semibold hover:text-primary">
                      {p.name}
                    </Link>
                    {p.sku ? <p className="mt-0.5 text-[0.72rem] text-muted-foreground">SKU {p.sku}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{specOf(p)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[p.condition, p.grade].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.availability || "Enquire for Availability"}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.price, p.show_price)}</td>
                  <td className="px-4 py-3">
                    {wa ? (
                      <a
                        href={whatsappLink(
                          wa,
                          `Hi R Computer Solutions, please share wholesale price and availability for ${p.name}. Thank you!`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-success/40 px-3 py-1.5 text-[0.72rem] font-bold text-success hover:bg-success/10"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Enquire
                      </a>
                    ) : (
                      <Link
                        to="/contact"
                        className="whitespace-nowrap text-[0.75rem] font-bold text-primary hover:underline"
                      >
                        Enquire
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No items match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </SiteShell>
  );
}
