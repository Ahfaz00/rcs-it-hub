import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { getProductsByIds } from "@/lib/discovery.functions";
import { useShortlist } from "@/lib/shortlist";

export const Route = createFileRoute("/wishlist")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Wishlist | R Computer Solution" },
      { name: "description", content: "Products you have saved for later at R Computer Solution." },
      { name: "robots", content: "noindex,follow" },
      { property: "og:title", content: "Your Wishlist | R Computer Solution" },
      { property: "og:description", content: "Saved refurbished hardware shortlist." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids, ready, clear } = useShortlist("wishlist");
  const { data } = useQuery({
    queryKey: ["products-by-ids", ids],
    queryFn: () => getProductsByIds({ data: { ids } }),
    enabled: ready && ids.length > 0,
  });

  const products = (data ?? []) as unknown as ProductCardData[];

  return (
    <SiteShell>
      <PageHero title="Wishlist" subtitle="Saved on this device. Send the list to us and we will quote it together." />
      <section className="container-page py-10 md:py-14">
        {!ready ? null : ids.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nothing saved yet.</p>
            <Button asChild className="mt-5 h-11 rounded-full px-6">
              <Link to="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{ids.length} saved</p>
              <Button variant="outline" size="sm" onClick={clear} className="rounded-full">
                Clear all
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </SiteShell>
  );
}
