import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listProducts } from "@/lib/public.functions";
import { submitProductRequest } from "@/lib/discovery.functions";
import { siteQueryOptions } from "@/lib/site-query";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Search Refurbished IT Hardware | R Computer Solution" },
      {
        name: "description",
        content: "Search refurbished laptops, desktops, workstations, monitors and parts available at R Computer Solution.",
      },
      { name: "robots", content: "noindex,follow" },
      { property: "og:title", content: "Search | R Computer Solution" },
      { property: "og:description", content: "Find the refurbished hardware you need." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [term, setTerm] = useState(q ?? "");

  const { data, isFetching } = useQuery({
    queryKey: ["search", q ?? ""],
    queryFn: () => listProducts({ data: { search: q, perPage: 24 } }),
    enabled: Boolean(q && q.trim().length > 1),
  });

  const products = (data?.products ?? []) as ProductCardData[];

  return (
    <SiteShell>
      <PageHero title={q ? `Results for “${q}”` : "Search"} subtitle="Search by model, processor, RAM, storage or SKU." />
      <section className="container-page py-8 md:py-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: { q: term.trim() || undefined } });
          }}
          className="mb-8 flex max-w-2xl gap-2"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search products"
              className="h-12 rounded-full pl-10"
            />
          </div>
          <Button type="submit" className="h-12 rounded-full px-6">
            Search
          </Button>
        </form>

        {isFetching ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : products.length ? (
          <>
            <p className="mb-5 text-sm text-muted-foreground">{data?.total ?? products.length} products found</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        ) : q ? (
          <NoResults term={q} />
        ) : null}
      </section>
    </SiteShell>
  );
}

function NoResults({ term }: { term: string }) {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    try {
      await submitProductRequest({
        data: {
          product_name: String(form.get("product_name") || term),
          quantity: String(form.get("quantity") || ""),
          budget: String(form.get("budget") || ""),
          name: String(form.get("name") || ""),
          phone: String(form.get("phone") || ""),
          email: String(form.get("email") || ""),
          message: String(form.get("message") || ""),
          source: "search",
        },
      });
      setDone(true);
      toast.success("Request sent. Our team will contact you.");
    } catch {
      toast.error("Could not send your request. Please try WhatsApp or call us.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-xl font-bold">No products found for “{term}”</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our stock changes daily. Tell us the model you need and we will check availability and pricing for you.
        </p>

        {done ? (
          <p className="mt-6 rounded-xl bg-success/10 p-4 text-sm font-medium text-success">
            Thanks — your request is with our sales team.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-2">
            <Input name="product_name" defaultValue={term} required placeholder="Product / model" aria-label="Product" />
            <Input name="quantity" placeholder="Quantity" aria-label="Quantity" />
            <Input name="name" required placeholder="Your name" aria-label="Your name" />
            <Input name="phone" required placeholder="Phone" aria-label="Phone" />
            <Input name="email" type="email" placeholder="Email (optional)" aria-label="Email" />
            <Input name="budget" placeholder="Budget (optional)" aria-label="Budget" />
            <Textarea name="message" placeholder="Configuration details" className="sm:col-span-2" aria-label="Details" />
            <Button type="submit" disabled={sending} className="h-11 rounded-full sm:col-span-2">
              {sending ? "Sending..." : "Request this product"}
            </Button>
          </form>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">Browse instead</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {site.categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to="/products"
                search={{ category: c.slug }}
                className="font-medium text-foreground hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/collections" className="font-semibold text-primary">
              All collections
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
