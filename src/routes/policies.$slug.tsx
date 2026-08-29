import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { getPageBySlug } from "@/lib/public.functions";

const pageQueryOptions = (slug: string) =>
  queryOptions({ queryKey: ["page", slug], queryFn: () => getPageBySlug({ data: { slug } }) });

export const Route = createFileRoute("/policies/$slug")({
  loader: async ({ context, params }) => {
    const page = await context.queryClient.ensureQueryData(pageQueryOptions(params.slug));
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.page;
    const title = p.seo_title || `${p.title} | R Computer Solutions`;
    const description = p.seo_description || `${p.title} of R Computer Solutions - The IT Hub, Navi Mumbai.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(p.robots ? [{ name: "robots", content: p.robots }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Page not found</h1>
        <Button asChild className="mt-6">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </SiteShell>
  ),
  component: PolicyPage,
});

function PolicyPage() {
  const { slug } = Route.useParams();
  const { data: page } = useSuspenseQuery(pageQueryOptions(slug));
  if (!page) return null;

  return (
    <SiteShell>
      <PageHero title={page.title} />
      <article className="container-page max-w-3xl whitespace-pre-line py-12 text-sm leading-relaxed text-muted-foreground">
        {page.body}
      </article>
    </SiteShell>
  );
}
