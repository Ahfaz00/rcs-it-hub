import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { getBrandBySlug } from "@/lib/discovery.functions";

const brandQuery = (slug: string) =>
  queryOptions({
    queryKey: ["brand", slug],
    queryFn: () => getBrandBySlug({ data: { slug } }),
    staleTime: 60 * 1000,
  });

export const Route = createFileRoute("/brands/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(brandQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Brand not found" }, { name: "robots", content: "noindex" }] };
    }
    const b = loaderData.brand;
    const title = b.seo_title || `Refurbished ${b.name} Laptops & Desktops | R Computer Solution`;
    const description =
      b.seo_description ||
      b.description ||
      `Quality tested refurbished ${b.name} laptops, desktops and workstations supplied across India from Navi Mumbai.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: BrandPage,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero title="Brand not found" subtitle="This brand page is not available." />
      <div className="container-page py-12">
        <Link to="/products" className="text-sm font-semibold text-primary">
          Browse all products
        </Link>
      </div>
    </SiteShell>
  ),
});

function BrandPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(brandQuery(slug));
  if (!data) return null;
  const { brand, products } = data;

  return (
    <SiteShell>
      <PageHero
        title={brand.name}
        {...(brand.description ? { subtitle: brand.description } : {})}
        breadcrumb={
          <span>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>{" "}
            /{" "}
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>{" "}
            / {brand.name}
          </span>
        }
      />
      <section className="container-page py-10 md:py-14">
        <p className="mb-6 text-sm text-muted-foreground">{products.length} products in stock listing</p>
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {(products as ProductCardData[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No live listings for this brand right now.</p>
        )}
      </section>
    </SiteShell>
  );
}
