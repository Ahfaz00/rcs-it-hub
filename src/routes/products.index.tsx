import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Stagger, StaggerItem } from "@/components/site/Motion";
import { listProducts, getCatalogFilters } from "@/lib/public.functions";

type ProductSearch = {
  search?: string | undefined;
  category?: string | undefined;
  brand?: string | undefined;
  condition?: string | undefined;
  type?: string | undefined;
  sort?: string | undefined;
  page?: number | undefined;
};

const PER_PAGE = 12;

const filtersQueryOptions = queryOptions({
  queryKey: ["catalog-filters"],
  queryFn: () => getCatalogFilters(),
  staleTime: 5 * 60 * 1000,
});

const productsQueryOptions = (search: ProductSearch) =>
  queryOptions({
    queryKey: ["products", search],
    queryFn: () => listProducts({ data: { ...search, perPage: PER_PAGE } }),
  });

export const Route = createFileRoute("/products/")({
  validateSearch: (raw: Record<string, unknown>): ProductSearch => ({
    search: typeof raw['search'] === "string" && raw['search'] ? raw['search'] : undefined,
    category: typeof raw['category'] === "string" && raw['category'] ? raw['category'] : undefined,
    brand: typeof raw['brand'] === "string" && raw['brand'] ? raw['brand'] : undefined,
    condition: typeof raw['condition'] === "string" && raw['condition'] ? raw['condition'] : undefined,
    type: typeof raw['type'] === "string" && raw['type'] ? raw['type'] : undefined,
    sort: typeof raw['sort'] === "string" && raw['sort'] ? raw['sort'] : undefined,
    page: raw['page'] ? Math.max(1, Number(raw['page'])) : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(filtersQueryOptions),
      context.queryClient.ensureQueryData(productsQueryOptions(deps)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Refurbished Laptops, Desktops & Workstations for Sale | R Computer Solutions" },
      {
        name: "description",
        content:
          "Browse quality tested refurbished laptops, desktops, workstations, monitors and IT hardware. Filter by category, brand and condition. Contact us for price and availability.",
      },
      { property: "og:title", content: "Refurbished IT Hardware Catalogue | R Computer Solutions" },
      {
        property: "og:description",
        content:
          "Refurbished laptops, desktops and workstations supplied from Navi Mumbai with bulk options and pan-India delivery.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: filters } = useSuspenseQuery(filtersQueryOptions);
  const { data } = useSuspenseQuery(productsQueryOptions(search));
  const [term, setTerm] = useState(search.search ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.max(1, Math.ceil(data.total / PER_PAGE));
  const page = search.page ?? 1;

  function update(patch: Partial<ProductSearch>) {
    navigate({
      search: (prev) => ({ ...prev, ...patch, page: patch.page ?? undefined }),
    });
  }

  const activeCount = [search.category, search.brand, search.condition, search.type, search.search].filter(
    Boolean,
  ).length;

  const filterPanel = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Filters</h2>
        {activeCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full text-xs"
            onClick={() => {
              setTerm("");
              navigate({ search: {} });
            }}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: term || undefined });
        }}
        className="space-y-2"
      >
        <Label htmlFor="filter-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="filter-search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Model, processor, SKU"
            className="rounded-full pl-9"
          />
        </div>
      </form>

      <FilterSelect
        label="Category"
        value={search.category}
        options={filters.categories.map((c) => ({ value: c.slug, label: c.name }))}
        onChange={(v) => update({ category: v })}
      />
      <FilterSelect
        label="Brand"
        value={search.brand}
        options={filters.brands.map((b) => ({ value: b.slug, label: b.name }))}
        onChange={(v) => update({ brand: v })}
      />
      <FilterSelect
        label="Condition"
        value={search.condition}
        options={filters.conditions.map((c) => ({ value: c, label: c }))}
        onChange={(v) => update({ condition: v })}
      />
      <FilterSelect
        label="Type"
        value={search.type}
        options={filters.types.map((t) => ({ value: t, label: t }))}
        onChange={(v) => update({ type: v })}
      />
    </div>
  );

  const categoryName = filters.categories.find((c) => c.slug === search.category)?.name;
  const brandName = filters.brands.find((b) => b.slug === search.brand)?.name;
  const activeChips = [
    search.search ? { key: "search" as const, label: `"${search.search}"` } : null,
    search.category ? { key: "category" as const, label: categoryName ?? search.category } : null,
    search.brand ? { key: "brand" as const, label: brandName ?? search.brand } : null,
    search.condition ? { key: "condition" as const, label: search.condition } : null,
    search.type ? { key: "type" as const, label: search.type } : null,
  ].filter(Boolean) as { key: keyof ProductSearch; label: string }[];

  return (
    <SiteShell>
      <PageHero
        title="Products"
        subtitle="Refurbished laptops, desktops, workstations, monitors, accessories and parts. Every unit is inspected and tested before dispatch."
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[270px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-border bg-card p-5 shadow-card">{filterPanel}</div>
        </aside>

        <div>
          <div className="mb-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{data.total}</span>{" "}
              {data.total === 1 ? "product" : "products"}
              {search.search ? ` for "${search.search}"` : ""}
            </p>
            <div className="grid grid-cols-2 items-center gap-2 sm:flex">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 rounded-full lg:hidden">
                    <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                    Filters{activeCount ? ` (${activeCount})` : ""}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto">
                  <SheetTitle className="sr-only">Filters</SheetTitle>
                  <div className="pt-2">{filterPanel}</div>
                  <Button className="mt-6 h-11 w-full rounded-full" onClick={() => setShowFilters(false)}>
                    Show {data.total} results
                  </Button>
                </SheetContent>
              </Sheet>
              <Select
                value={search.sort ?? "newest"}
                onValueChange={(v) => update({ sort: v === "newest" ? undefined : v })}
              >
                <SelectTrigger className="h-10 w-full min-w-0 rounded-full sm:w-[170px]" aria-label="Sort products">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeChips.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    if (chip.key === "search") setTerm("");
                    update({ [chip.key]: undefined } as Partial<ProductSearch>);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}

          {data.products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <h2 className="font-display text-lg font-semibold">No products match your filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try clearing filters, or send us your requirement and we will check availability.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => navigate({ search: {} })}>
                  Clear filters
                </Button>
                <Button asChild className="rounded-full">
                  <Link to="/bulk-orders">Send requirement</Link>
                </Button>
              </div>
            </div>
          ) : (
            <Stagger className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-5 xl:grid-cols-3" stagger={0.06}>
              {data.products.map((p) => (
                <StaggerItem key={p.id} className="h-full [&>*]:h-full">
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          )}


          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => update({ page: page - 1 === 1 ? undefined : page - 1 })}
              >
                Previous
              </Button>
              <span className="px-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => update({ page: page + 1 })}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </SiteShell>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value?: string | undefined) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value ?? "__all"} onValueChange={(v) => onChange(v === "__all" ? undefined : v)}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All {label.toLowerCase()}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
