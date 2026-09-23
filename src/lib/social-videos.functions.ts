import { createServerFn } from "@tanstack/react-start";

import { cached } from "./cache.server";

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
  configured: boolean;
  videos: SocialVideo[];
  profiles: { platform: "instagram"; name: string; url: string }[];
  notice: string | null;
};

type InstagramMedia = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  username?: string;
};

type InstagramList = { data?: InstagramMedia[]; error?: { message?: string } };

function summary(value: string | undefined, fallback: string): string {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

/**
 * Latest Instagram videos/reels via the Instagram API with Instagram Login.
 * Requires a professional (Business/Creator) Instagram account and a
 * long-lived INSTAGRAM_ACCESS_TOKEN secret. No Facebook Page needed.
 */
export const listSocialVideos = createServerFn({ method: "GET" }).handler(async () => {
  return cached<SocialVideoFeed>("social-videos", 30 * 60 * 1000, async () => {
    const token = process.env["INSTAGRAM_ACCESS_TOKEN"]?.trim();
    if (!token) {
      return {
        configured: false,
        videos: [],
        profiles: [],
        notice: "Instagram feed connection is awaiting setup.",
      };
    }

    try {
      const url = new URL("https://graph.instagram.com/me/media");
      url.searchParams.set(
        "fields",
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username",
      );
      url.searchParams.set("limit", "24");
      url.searchParams.set("access_token", token);
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const body = (await response.json()) as InstagramList;
      if (!response.ok || body.error) {
        throw new Error(body.error?.message || `Instagram request failed (${response.status}).`);
      }

      const videos = (body.data ?? [])
        .filter((media) => media.id && media.media_type === "VIDEO" && media.permalink)
        .map((media) => ({
          id: `instagram-${media.id}`,
          platform: "instagram" as const,
          title: summary(media.caption, "Instagram reel"),
          published: media.timestamp || "",
          thumbnail: media.thumbnail_url || null,
          videoUrl: media.media_url || null,
          permalink: media.permalink || "https://www.instagram.com/",
          accountName: media.username ? `@${media.username}` : "Instagram",
        }));

      const username = videos[0]?.accountName.replace(/^@/, "");
      const profiles = username
        ? [
            {
              platform: "instagram" as const,
              name: `@${username}`,
              url: `https://www.instagram.com/${username}/`,
            },
          ]
        : [];

      return {
        configured: true,
        videos,
        profiles,
        notice: videos.length ? null : "No Instagram videos or reels were found yet.",
      };
    } catch (error) {
      console.error("Instagram video feed failed:", error instanceof Error ? error.message : error);
      return {
        configured: true,
        videos: [],
        profiles: [],
        notice: "The Instagram feed is temporarily unavailable. Please visit our Instagram page.",
      };
    }
  });
});
