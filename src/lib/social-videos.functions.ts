import { createServerFn } from "@tanstack/react-start";

export type SocialPlatform = "instagram" | "facebook";

export type SocialVideo = {
  id: string;
  platform: SocialPlatform;
  title: string;
  published: string;
  thumbnail: string | null;
  videoUrl: string | null;
  permalink: string;
  accountName: string;
};

export type SocialVideoFeed = {
  videos: SocialVideo[];
  profiles: { platform: SocialPlatform; name: string; url: string }[];
  notice: string | null;
  facebookNotice: string | null;
};

function summary(value: string | undefined, fallback: string): string {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

async function fetchFacebookVideos(
  supabase: ReturnType<typeof import("./supabase-public.server").createPublicServerClient>,
): Promise<{ videos: SocialVideo[]; error: string | null }> {
  const { data, error } = await supabase
    .from("facebook_videos")
    .select("id,title,caption,facebook_url,thumbnail_url,published_at,created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { videos: [], error: "Facebook videos will appear here soon." };
  return {
    error: data?.length ? null : "Facebook videos will appear here soon.",
    videos: (data ?? []).map((v) => ({
      id: `facebook-${v.id}`,
      platform: "facebook" as const,
      title: summary(v.title || v.caption || undefined, "Facebook video"),
      published: v.published_at || v.created_at,
      thumbnail: v.thumbnail_url || null,
      videoUrl: null,
      permalink: v.facebook_url,
      accountName: "Facebook",
    })),
  };
}

export const listSocialVideos = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const supabase = createPublicServerClient();
  const [{ data, error }, facebook] = await Promise.all([
    supabase
      .from("instagram_videos")
      .select("id,title,caption,instagram_url,thumbnail_url,published_at,created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100),
    fetchFacebookVideos(supabase),
  ]);
  if (error) throw new Error(error.message);

  const instagram: SocialVideo[] = (data ?? []).map((media) => ({
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
    videos: [...instagram, ...facebook.videos],
    profiles: [],
    notice: instagram.length ? null : "Instagram reels will be added here soon.",
    facebookNotice: facebook.videos.length ? null : facebook.error,
  };
  return feed;
});
