import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Play, Youtube, X } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { listChannelVideos } from "@/lib/videos.functions";
import { Stagger, StaggerItem } from "@/components/site/Motion";

const CHANNEL_URL = "https://www.youtube.com/@rcomputersolutions";

const videosQueryOptions = queryOptions({
  queryKey: ["yt-videos"],
  queryFn: () => listChannelVideos(),
  staleTime: 30 * 60 * 1000,
});

export const Route = createFileRoute("/videos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(videosQueryOptions),
  head: () => ({
    meta: [
      { title: "Videos | Refurbished Laptop Stock Tours | R Computer Solutions" },
      {
        name: "description",
        content:
          "Watch bulk stock walkthroughs, laptop and monitor configuration videos and facility tours from R Computer Solutions, Navi Mumbai.",
      },
      { property: "og:title", content: "Videos | R Computer Solutions" },
      {
        property: "og:description",
        content: "Live stock tours, configuration breakdowns and deals from our YouTube channel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  const { data: videos } = useSuspenseQuery(videosQueryOptions);
  const [active, setActive] = useState<string | null>(null);

  return (
    <SiteShell>
      <PageHero
        title="Videos"
        subtitle="Bulk stock tours, configuration walkthroughs and deals — straight from our YouTube channel."
      />
      <div className="container-page py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {videos.length > 0 ? `${videos.length} latest videos` : "Latest videos"}
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              <Youtube className="mr-2 h-4 w-4" /> Subscribe on YouTube
            </a>
          </Button>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <h2 className="font-display text-lg font-semibold">Videos loading soon</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Visit our YouTube channel for the latest stock videos.
            </p>
            <Button asChild className="mt-5 rounded-full">
              <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                Open channel
              </a>
            </Button>
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <StaggerItem key={v.id}>
                <button
                  type="button"
                  onClick={() => setActive(v.id)}
                  className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary">
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </span>
                    </span>
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-sm font-semibold leading-snug">{v.title}</h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {v.published ? new Date(v.published).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : null}
                    </p>
                  </div>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                aria-label="Close video"
                onClick={() => setActive(null)}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${active}?autoplay=1&rel=0`}
                title="R Computer Solutions video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </SiteShell>
  );
}
