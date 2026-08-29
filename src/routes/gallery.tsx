import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { listGallery } from "@/lib/public.functions";
import { mediaUrl } from "@/lib/media";

const galleryQueryOptions = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => listGallery(),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQueryOptions),
  head: () => ({
    meta: [
      { title: "Gallery | R Computer Solutions, Navi Mumbai" },
      {
        name: "description",
        content:
          "Photos of our Navi Mumbai facility, refurbished stock and testing process at R Computer Solutions - The IT Hub.",
      },
      { property: "og:title", content: "Gallery | R Computer Solutions" },
      { property: "og:description", content: "Inside our refurbished IT hardware facility in Navi Mumbai." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: items } = useSuspenseQuery(galleryQueryOptions);

  return (
    <SiteShell>
      <PageHero title="Gallery" subtitle="Our facility, stock and refurbishment process." />
      <div className="container-page py-12">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <h2 className="font-display text-lg font-semibold">Photos coming soon</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We are adding photographs of our facility and stock. In the meantime, get in touch and we will
              share images of any unit you are interested in.
            </p>
            <Button asChild className="mt-5">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <figure
                key={item.id}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-card"
              >
                <img
                  src={mediaUrl(item.image_url) ?? ""}
                  alt={item.alt_text || item.title || "R Computer Solutions facility"}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover"
                />
                {item.title || item.caption ? (
                  <figcaption className="p-4">
                    {item.title ? <p className="font-display text-sm font-semibold">{item.title}</p> : null}
                    {item.caption ? (
                      <p className="mt-1 text-xs text-muted-foreground">{item.caption}</p>
                    ) : null}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
