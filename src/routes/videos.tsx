import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Facebook, Instagram, Play, X } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { listSocialVideos, type SocialVideo } from "@/lib/social-videos.functions";
import { Stagger, StaggerItem } from "@/components/site/Motion";

const videosQueryOptions = queryOptions({
  queryKey: ["social-videos"],
  queryFn: () => listSocialVideos(),
  staleTime: 30 * 60 * 1000,
});

export const Route = createFileRoute("/videos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(videosQueryOptions),
  head: () => ({
    meta: [
      { title: "Facebook & Instagram Videos | R Computer Solutions" },
      {
        name: "description",
        content:
          "Watch the latest Facebook and Instagram reels, stock walkthroughs and hardware videos from R Computer Solutions, Navi Mumbai.",
      },
      { property: "og:title", content: "Facebook & Instagram Videos | R Computer Solutions" },
      {
        property: "og:description",
        content: "Latest stock tours, configuration breakdowns and deals from our Facebook and Instagram pages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "keywords", content: "refurbished laptop reels, bulk laptop stock videos, r computer solutions facebook instagram" },
      { property: "og:url", content: "https://rcs-it-hub.lovable.app/videos" },
    ],
    links: [{ rel: "canonical", href: "https://rcs-it-hub.lovable.app/videos" }],
  }),
  component: VideosPage,
});

function VideosPage() {
  const { data: feed } = useSuspenseQuery(videosQueryOptions);
  const [active, setActive] = useState<SocialVideo | null>(null);
  const [filter, setFilter] = useState<"all" | "facebook" | "instagram">("all");
  const videos = filter === "all" ? feed.videos : feed.videos.filter((video) => video.platform === filter);

  return (
    <SiteShell>
      <PageHero
        title="Videos"
        subtitle="Latest stock tours, configuration walkthroughs and deals from our Facebook and Instagram pages."
      />
      <div className="container-page py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {feed.videos.length > 0 ? `${feed.videos.length} latest videos` : "Latest videos"}
          </p>
          <div className="flex flex-wrap gap-2" aria-label="Filter videos by platform">
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
            <Button size="sm" variant={filter === "facebook" ? "default" : "outline"} onClick={() => setFilter("facebook")}>
              <Facebook /> Facebook
            </Button>
            <Button size="sm" variant={filter === "instagram" ? "default" : "outline"} onClick={() => setFilter("instagram")}>
              <Instagram /> Instagram
            </Button>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <h2 className="font-display text-lg font-semibold">
              {filter === "all" ? "Social videos coming soon" : `No ${filter} videos yet`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {feed.notice || "New Facebook and Instagram videos will appear here automatically."}
            </p>
            {feed.profiles.length > 0 ? (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {feed.profiles.map((profile) => (
                  <Button key={profile.url} asChild variant="outline">
                    <a href={profile.url} target="_blank" rel="noopener noreferrer">
                      {profile.platform === "facebook" ? <Facebook /> : <Instagram />}
                      {profile.name}
                    </a>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <StaggerItem key={v.id}>
                <button
                  type="button"
                  onClick={() => setActive(v)}
                  className="group block w-full overflow-hidden rounded-lg border border-border bg-card text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {v.thumbnail ? <img src={v.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                    <span className="absolute inset-0 grid place-items-center bg-ink/30 transition-colors group-hover:bg-ink/45">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-background text-primary shadow-card">
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </span>
                    </span>
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground">
                      {v.platform === "facebook" ? <Facebook className="h-3.5 w-3.5" /> : <Instagram className="h-3.5 w-3.5" />}
                      {v.platform === "facebook" ? "Facebook" : "Instagram"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-sm font-semibold leading-snug">{v.title}</h2>
                    <p className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{v.accountName}</span>
                      <span>
                      {v.published ? new Date(v.published).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : null}
                      </span>
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
          className="fixed inset-0 z-[100] grid place-items-center bg-ink/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Close video"
                onClick={() => setActive(null)}
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg bg-ink">
              {active.videoUrl ? (
                <video src={active.videoUrl} poster={active.thumbnail || undefined} controls autoPlay playsInline className="max-h-[75vh] w-full bg-ink object-contain" />
              ) : (
                <div className="grid aspect-video place-items-center p-8 text-center text-primary-foreground">
                  Open this video on {active.platform === "facebook" ? "Facebook" : "Instagram"} to watch it.
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Button asChild variant="secondary">
                <a href={active.permalink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Open on {active.platform === "facebook" ? "Facebook" : "Instagram"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </SiteShell>
  );
}
