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

const GRAPH = "https://graph.facebook.com/v21.0";

async function fetchFacebookVideos(): Promise<{ videos: SocialVideo[]; error: string | null }> {
  const pageId = process.env["FACEBOOK_PAGE_ID"];
  const token = process.env["FACEBOOK_ACCESS_TOKEN"];
  if (!pageId || !token) return { videos: [], error: "Facebook videos will be added here soon." };
  try {
    // A user token is swapped for the Page token; a Page token is used as-is.
    let pageToken = token;
    const accounts = await fetch(`${GRAPH}/me/accounts?fields=id,access_token&access_token=${token}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (accounts.ok) {
      const json = (await accounts.json()) as { data?: { id: string; access_token?: string }[] };
      const match = json.data?.find((p) => p.id === pageId);
      if (match?.access_token) pageToken = match.access_token;
    }
    const res = await fetch(
      `${GRAPH}/${pageId}/videos?fields=id,title,description,created_time,picture,permalink_url,from{name}&limit=50&access_token=${pageToken}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    const json = (await res.json()) as {
      data?: {
        id: string;
        title?: string;
        description?: string;
        created_time: string;
        picture?: string;
        permalink_url?: string;
        from?: { name?: string };
      }[];
      error?: { message?: string };
    };
    if (!res.ok || !json.data) {
      console.error("Facebook videos error:", json.error?.message);
      return { videos: [], error: "Facebook videos will appear here soon." };
    }
    return {
      error: null,
      videos: json.data.map((v) => ({
        id: `facebook-${v.id}`,
        platform: "facebook" as const,
        title: summary(v.title || v.description, "Facebook video"),
        published: v.created_time,
        thumbnail: v.picture || null,
        videoUrl: null,
        permalink: v.permalink_url
          ? v.permalink_url.startsWith("http")
            ? v.permalink_url
            : `https://www.facebook.com${v.permalink_url}`
          : `https://www.facebook.com/watch/?v=${v.id}`,
        accountName: v.from?.name || "Facebook",
      })),
    };
  } catch (e) {
    console.error("Facebook videos failed:", e);
    return { videos: [], error: "Facebook videos will appear here soon." };
  }
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
    fetchFacebookVideos(),
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
