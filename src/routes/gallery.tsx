import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Expand } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { listGallery } from "@/lib/public.functions";
import { mediaUrl } from "@/lib/media";
import { Lightbox, type LightboxImage } from "@/components/site/Lightbox";
import { Stagger, StaggerItem } from "@/components/site/Motion";

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
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const lightboxImages: LightboxImage[] = items
    .map((i) => ({
      src: mediaUrl(i.image_url) ?? "",
      alt: i.alt_text || i.title || "R Computer Solutions facility",
    }))
    .filter((i) => i.src !== "");

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
          <>
            {open && lightboxImages.length > 0 ? (
              <Lightbox
                images={lightboxImages}
                index={Math.min(index, lightboxImages.length - 1)}
                onIndexChange={setIndex}
                onClose={() => setOpen(false)}
              />
            ) : null}
            <Stagger className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4" stagger={0.06}>
              {items.map((item, i) => (
                <StaggerItem key={item.id} className="break-inside-avoid">
                  <figure className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lift">
                    <button
                      type="button"
                      onClick={() => {
                        setIndex(i);
                        setOpen(true);
                      }}
                      aria-label={`Open image ${i + 1}`}
                      className="relative block w-full cursor-zoom-in overflow-hidden"
                    >
                      <img
                        src={mediaUrl(item.image_url) ?? ""}
                        alt={item.alt_text || item.title || "R Computer Solutions facility"}
                        loading="lazy"
                        decoding="async"
                        className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Expand className="h-3.5 w-3.5" /> View
                      </span>
                    </button>
                    {item.title || item.caption ? (
                      <figcaption className="p-4">
                        {item.title ? (
                          <p className="font-display text-sm font-semibold">{item.title}</p>
                        ) : null}
                        {item.caption ? (
                          <p className="mt-1 text-xs text-muted-foreground">{item.caption}</p>
                        ) : null}
                      </figcaption>
                    ) : null}
                  </figure>
                </StaggerItem>
              ))}
            </Stagger>
          </>
        )}
      </div>
    </SiteShell>
  );
}
