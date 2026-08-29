import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Icon } from "@/components/site/Icon";
import { Button } from "@/components/ui/button";
import { listServices } from "@/lib/public.functions";

const servicesQueryOptions = queryOptions({
  queryKey: ["services"],
  queryFn: () => listServices(),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/services/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQueryOptions),
  head: () => ({
    meta: [
      { title: "IT Services - Repair, AMC, Rental & Bulk Supply | R Computer Solutions" },
      {
        name: "description",
        content:
          "Laptop and desktop repair, hardware and SSD upgrades, CCTV service, AMC, IT rental, bulk supply and corporate IT solutions from R Computer Solutions, Navi Mumbai.",
      },
      { property: "og:title", content: "IT Services | R Computer Solutions" },
      {
        property: "og:description",
        content: "Repair, upgrades, AMC, rental and corporate IT support from our Navi Mumbai facility.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQueryOptions);

  return (
    <SiteShell>
      <PageHero
        title="Services"
        subtitle="Repair, upgrades, maintenance, rental and bulk supply - handled in-house from our Mahape facility."
      />
      <div className="container-page grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.id}
            className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <Icon name={service.icon} className="h-6 w-6 text-accent" />
            <h2 className="mt-4 font-display text-lg font-semibold">{service.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
            {service.benefits && service.benefits.length > 0 ? (
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {service.benefits.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
            <Button asChild variant="ghost" className="mt-auto w-fit px-0 pt-5 hover:bg-transparent">
              <Link to="/services/$slug" params={{ slug: service.slug }}>
                Learn more <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
