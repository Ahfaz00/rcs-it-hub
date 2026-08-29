import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { getPageBySlug } from "@/lib/public.functions";
import { siteQueryOptions } from "@/lib/site-query";

const aboutQueryOptions = queryOptions({
  queryKey: ["page", "about"],
  queryFn: () => getPageBySlug({ data: { slug: "about" } }),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(aboutQueryOptions),
  head: () => ({
    meta: [
      { title: "About R Computer Solutions - The IT Hub, Navi Mumbai" },
      {
        name: "description",
        content:
          "R Computer Solutions - The IT Hub is a computer wholesaler in Navi Mumbai supplying refurbished laptops, desktops, workstations and IT hardware with repair, AMC and rental services.",
      },
      { property: "og:title", content: "About R Computer Solutions - The IT Hub" },
      {
        property: "og:description",
        content: "Computer wholesaler in Navi Mumbai for refurbished IT hardware, repair, AMC and rental.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: page } = useSuspenseQuery(aboutQueryOptions);
  const { data: site } = useSuspenseQuery(siteQueryOptions);

  return (
    <SiteShell>
      <PageHero
        title={page?.title ?? "About us"}
        subtitle={site.settings["tagline"] ?? "Computer wholesaler"}
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {page?.body ?? "Content coming soon."}
        </article>

        <aside className="h-fit space-y-4 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-base font-semibold">Reach us</h2>
          <dl className="space-y-3 text-sm">
            {site.settings["address"] ? (
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="mt-0.5 whitespace-pre-line font-medium">{site.settings["address"]}</dd>
              </div>
            ) : null}
            {site.settings["phone"] ? (
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-0.5 font-medium">{site.settings["phone"]}</dd>
              </div>
            ) : null}
            {site.settings["email"] ? (
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-0.5 font-medium break-all">{site.settings["email"]}</dd>
              </div>
            ) : null}
            {site.settings["business_hours"] ? (
              <div>
                <dt className="text-muted-foreground">Business hours</dt>
                <dd className="mt-0.5 font-medium">{site.settings["business_hours"]}</dd>
              </div>
            ) : null}
          </dl>
          <Button asChild className="w-full">
            <Link to="/contact">Contact us</Link>
          </Button>
        </aside>
      </div>
    </SiteShell>
  );
}
