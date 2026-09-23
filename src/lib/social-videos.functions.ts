import { createServerFn } from "@tanstack/react-start";

export type SocialVideo = {
  id: string;
  platform: "instagram";
  title: string;
  published: string;
  thumbnail: string | null;
  videoUrl: string | null;
  permalink: string;
  accountName: string;
};

export type SocialVideoFeed = {
  videos: SocialVideo[];
  profiles: { platform: "instagram"; name: string; url: string }[];
  notice: string | null;
};

function summary(value: string | undefined, fallback: string): string {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

export const listSocialVideos = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("instagram_videos")
    .select("id,title,caption,instagram_url,thumbnail_url,published_at,created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  const videos = (data ?? []).map((media) => ({
    id: `instagram-${media.id}`,
    platform: "instagram" as const,
    title: summary(media.title || media.caption || undefined, "Instagram reel"),
    published: media.published_at || media.created_at,
    thumbnail: media.thumbnail_url || null,
    videoUrl: null,
    permalink: media.instagram_url,
    accountName: "Instagram",
  }));

  const feed: SocialVideoFeed = {
    videos,
    profiles: [],
    notice: videos.length ? null : "Instagram reels will be added here soon.",
  };
  return feed;
});
