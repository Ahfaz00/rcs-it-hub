import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { listCollections } from "@/lib/discovery.functions";
import { mediaUrl } from "@/lib/media";

const collectionsQuery = queryOptions({
  queryKey: ["collections"],
  queryFn: () => listCollections(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Product Collections | R Computer Solution" },
      {
        name: "description",
        content:
          "Browse curated collections of refurbished laptops, desktops and workstations by budget, deals and best sellers.",
      },
      { property: "og:title", content: "Product Collections | R Computer Solution" },
      {
        property: "og:description",
        content: "Curated refurbished IT hardware collections by budget, deals and best sellers.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionsQuery),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data: collections } = useSuspenseQuery(collectionsQuery);

  return (
    <SiteShell>
      <PageHero
        title="Collections"
        subtitle="Shortlists curated by our team — by budget, by deal and by what businesses buy most."
      />
      <section className="container-page py-12 md:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => {
            const img = mediaUrl(c.image_url);
            return (
              <Link
                key={c.id}
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="group relative flex min-h-[10rem] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lift"
              >
                {img ? (
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-15 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="relative">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                    {c.kind === "budget" ? "Shop by budget" : c.kind === "auto" ? "Auto updated" : "Curated"}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold tracking-tight">{c.name}</h2>
                  {c.short_description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{c.short_description}</p>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    View collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Collections will appear here once added in the admin panel.</p>
        ) : null}
      </section>
    </SiteShell>
  );
}
