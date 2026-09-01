import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { getUsageTag } from "@/lib/discovery.functions";

const usageQuery = (slug: string) =>
  queryOptions({
    queryKey: ["usage", slug],
    queryFn: () => getUsageTag({ data: { slug } }),
    staleTime: 60 * 1000,
  });

export const Route = createFileRoute("/laptops/$usage")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(usageQuery(params.usage));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Page not found" }, { name: "robots", content: "noindex" }] };
    }
    const t = loaderData.tag;
    const title = t.seo_title || `Refurbished Laptops ${t.name} | R Computer Solution`;
    const description =
      t.seo_description ||
      t.short_description ||
      `Hand-picked refurbished laptops suited to ${t.name.toLowerCase()}, quality tested and supplied from Navi Mumbai.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: UsagePage,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero title="Page not found" subtitle="This use-case page is not available." />
      <div className="container-page py-12">
        <Link to="/products" className="text-sm font-semibold text-primary">
          Browse all products
        </Link>
      </div>
    </SiteShell>
  ),
});

function UsagePage() {
  const { usage } = Route.useParams();
  const { data } = useSuspenseQuery(usageQuery(usage));
  if (!data) return null;
  const { tag, products } = data;

  return (
    <SiteShell>
      <PageHero
        title={`Laptops ${tag.name.toLowerCase().startsWith("for") ? tag.name : `for ${tag.name}`}`}
        {...(tag.short_description ? { subtitle: tag.short_description } : {})}
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>{" "}
            /{" "}
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>{" "}
            / {tag.name}
          </span>
        }
      />
      <section className="container-page py-10 md:py-14">
        {tag.description ? (
          <div
            className="prose prose-sm mb-8 max-w-3xl text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: tag.description }}
          />
        ) : null}
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {(products as ProductCardData[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No products tagged for this use case yet. Share your requirement and we will recommend the right
              configuration.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-navy px-6 text-sm font-bold text-navy-foreground"
            >
              Get a recommendation
            </Link>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
