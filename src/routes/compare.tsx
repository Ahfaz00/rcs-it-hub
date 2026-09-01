import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Scale, X } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { getProductsByIds } from "@/lib/discovery.functions";
import { useShortlist } from "@/lib/shortlist";
import { mediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/format";

const ROWS: { label: string; key: string }[] = [
  { label: "Brand", key: "brand" },
  { label: "Condition", key: "condition" },
  { label: "Grade", key: "grade" },
  { label: "Processor", key: "processor_model" },
  { label: "Generation", key: "processor_generation" },
  { label: "Cores", key: "cpu_cores" },
  { label: "RAM", key: "ram" },
  { label: "RAM type", key: "ram_type" },
  { label: "Storage", key: "storage_capacity" },
  { label: "Storage type", key: "storage_type" },
  { label: "Display", key: "display_size" },
  { label: "Resolution", key: "display_resolution" },
  { label: "Graphics", key: "graphics_type" },
  { label: "GPU", key: "gpu_model" },
  { label: "Operating system", key: "operating_system" },
  { label: "Ports", key: "ports" },
  { label: "Weight", key: "weight" },
  { label: "Warranty", key: "warranty" },
  { label: "Availability", key: "availability" },
];

type Row = Record<string, unknown> & {
  id: string;
  name: string;
  slug: string;
  main_image_url?: string | null;
  main_image_alt?: string | null;
  price?: number | null;
  show_price?: boolean | null;
  brands?: { name: string } | null;
};

export const Route = createFileRoute("/compare")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Compare Products | R Computer Solution" },
      { name: "description", content: "Compare refurbished laptops and desktops side by side on specifications and price." },
      { name: "robots", content: "noindex,follow" },
      { property: "og:title", content: "Compare Products | R Computer Solution" },
      { property: "og:description", content: "Side by side specification comparison." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, ready, remove, clear, limit } = useShortlist("compare");
  const { data } = useQuery({
    queryKey: ["compare", ids],
    queryFn: () => getProductsByIds({ data: { ids } }),
    enabled: ready && ids.length > 0,
  });

  const products = (data ?? []) as unknown as Row[];

  return (
    <SiteShell>
      <PageHero title="Compare" subtitle={`Put up to ${limit} machines side by side before you enquire.`} />
      <section className="container-page py-10 md:py-14">
        {!ready ? null : products.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Scale className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Add products to compare from any product card.</p>
            <Button asChild className="mt-5 h-11 rounded-full px-6">
              <Link to="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clear} className="rounded-full">
                Clear
              </Button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[40rem] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-40 border-b border-border p-3 text-left align-top text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Product
                    </th>
                    {products.map((p) => {
                      const img = mediaUrl(p.main_image_url as string | null);
                      return (
                        <th key={p.id} className="border-b border-l border-border p-3 text-left align-top">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to="/products/$slug"
                              params={{ slug: p.slug }}
                              className="text-sm font-semibold hover:text-primary"
                            >
                              {p.name}
                            </Link>
                            <button
                              onClick={() => remove(p.id)}
                              aria-label={`Remove ${p.name} from comparison`}
                              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {img ? (
                            <img src={img} alt={p.name} loading="lazy" className="mt-2 h-24 w-full object-contain" />
                          ) : null}
                          <p className="mt-2 font-bold">{formatPrice(p.price, p.show_price)}</p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key} className="even:bg-muted/30">
                      <td className="border-b border-border p-3 font-medium text-muted-foreground">{row.label}</td>
                      {products.map((p) => {
                        const value =
                          row.key === "brand" ? (p.brands?.name ?? null) : ((p[row.key] as string | null) ?? null);
                        return (
                          <td key={p.id + row.key} className="border-b border-l border-border p-3">
                            {value ? String(value) : <span className="text-muted-foreground">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </SiteShell>
  );
}
