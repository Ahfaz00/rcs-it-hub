import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { EnquiryDialog } from "@/components/site/EnquiryDialog";
import { Button } from "@/components/ui/button";
import { getServiceBySlug } from "@/lib/public.functions";

const serviceQueryOptions = (slug: string) =>
  queryOptions({ queryKey: ["service", slug], queryFn: () => getServiceBySlug({ data: { slug } }) });

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const service = await context.queryClient.ensureQueryData(serviceQueryOptions(params.slug));
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Service not found" }, { name: "robots", content: "noindex" }] };
    }
    const s = loaderData.service;
    const title = s.seo_title || `${s.title} | R Computer Solutions, Navi Mumbai`;
    const description =
      s.seo_description ||
      s.short_description ||
      `${s.title} from R Computer Solutions, Navi Mumbai.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Service not found</h1>
        <Button asChild className="mt-6">
          <Link to="/services">All services</Link>
        </Button>
      </div>
    </SiteShell>
  ),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: service } = useSuspenseQuery(serviceQueryOptions(slug));
  if (!service) return null;

  return (
    <SiteShell>
      <PageHero title={service.title} subtitle={service.short_description ?? undefined} />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
          {service.benefits && service.benefits.length > 0 ? (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold">What is included</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {service.benefits.map((b) => (
                  <li key={b} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-base font-semibold">Request this service</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about your requirement and we will respond with next steps and pricing.
          </p>
          <EnquiryDialog
            productName={service.title}
            source="service-page"
            trigger={<Button className="mt-5 w-full">Send enquiry</Button>}
          />
          <Button asChild variant="outline" className="mt-3 w-full">
            <Link to="/contact">Contact details</Link>
          </Button>
        </aside>
      </div>
    </SiteShell>
  );
}
