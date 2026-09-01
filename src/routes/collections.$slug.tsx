import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { getCollection } from "@/lib/discovery.functions";

const collectionQuery = (slug: string) =>
  queryOptions({
    queryKey: ["collection", slug],
    queryFn: () => getCollection({ data: { slug } }),
    staleTime: 60 * 1000,
  });

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(collectionQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Collection not found" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.collection;
    const title = c.seo_title || `${c.name} — Refurbished IT Hardware | R Computer Solution`;
    const description =
      c.seo_description ||
      c.short_description ||
      `Browse ${c.name} from R Computer Solution — quality tested refurbished laptops, desktops and workstations.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CollectionPage,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero title="Collection not found" subtitle="This collection may have been renamed or removed." />
      <div className="container-page py-12">
        <Link to="/collections" className="text-sm font-semibold text-primary">
          Browse all collections
        </Link>
      </div>
    </SiteShell>
  ),
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(collectionQuery(slug));
  if (!data) return null;
  const { collection, products } = data;

  return (
    <SiteShell>
      <PageHero
        title={collection.name}
        {...(collection.short_description ? { subtitle: collection.short_description } : {})}
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>{" "}
            /{" "}
            <Link to="/collections" className="hover:text-primary">
              Collections
            </Link>{" "}
            / {collection.name}
          </span>
        }
      />
      <section className="container-page py-10 md:py-14">
        <p className="mb-6 text-sm text-muted-foreground">{products.length} products</p>
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {(products as ProductCardData[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing in this collection right now. Tell us what you need and we will source it.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-navy px-6 text-sm font-bold text-navy-foreground"
            >
              Ask our team
            </Link>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
