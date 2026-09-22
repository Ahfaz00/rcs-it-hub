import { createServerFn } from "@tanstack/react-start";

import { cached } from "./cache.server";

export type SocialVideo = {
  id: string;
  platform: "facebook" | "instagram";
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
  profiles: { platform: "facebook" | "instagram"; name: string; url: string }[];
  notice: string | null;
};

type GraphPage = {
  id?: string;
  name?: string;
  link?: string;
  access_token?: string;
  instagram_business_account?: { id?: string; username?: string };
};

type GraphFacebookVideo = {
  id?: string;
  title?: string;
  description?: string;
  created_time?: string;
  permalink_url?: string;
  picture?: string;
  source?: string;
};

type GraphInstagramVideo = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  username?: string;
};

type GraphList<T> = { data?: T[]; error?: { message?: string } };

const GRAPH_VERSION = "v24.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

function summary(value: string | undefined, fallback: string): string {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

async function graphGet<T>(path: string, token: string, fields: string): Promise<T> {
  const url = new URL(`${GRAPH_URL}/${path.replace(/^\//, "")}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", "16");
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const body = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok || body.error) {
    throw new Error(body.error?.message || `Meta request failed (${response.status}).`);
  }
  return body;
}

export const listSocialVideos = createServerFn({ method: "GET" }).handler(async () => {
  return cached<SocialVideoFeed>("social-videos", 30 * 60 * 1000, async () => {
    const token = process.env["META_ACCESS_TOKEN"]?.trim();
    if (!token) {
      return {
        configured: false,
        videos: [],
        profiles: [],
        notice: "Facebook and Instagram feed connection is awaiting setup.",
      };
    }

    try {
      const accounts = await graphGet<GraphList<GraphPage>>(
        "me/accounts",
        token,
        "id,name,link,access_token,instagram_business_account{id,username}",
      );
      const pages = accounts.data ?? [];
      const profiles: SocialVideoFeed["profiles"] = [];

      for (const page of pages) {
        if (page.link) {
          profiles.push({ platform: "facebook", name: page.name || "Facebook", url: page.link });
        }
        const instagram = page.instagram_business_account;
        if (instagram?.username) {
          profiles.push({
            platform: "instagram",
            name: `@${instagram.username}`,
            url: `https://www.instagram.com/${instagram.username}/`,
          });
        }
      }

      const groups = await Promise.all(
        pages.map(async (page) => {
          const pageToken = page.access_token || token;
          const requests: Promise<SocialVideo[]>[] = [];

          if (page.id) {
            requests.push(
              graphGet<GraphList<GraphFacebookVideo>>(
                `${page.id}/videos`,
                pageToken,
                "id,title,description,created_time,permalink_url,picture,source",
              ).then((result) =>
                (result.data ?? [])
                  .filter((video) => video.id && video.permalink_url)
                  .map((video) => ({
                    id: `facebook-${video.id}`,
                    platform: "facebook" as const,
                    title: summary(video.title || video.description, "Facebook video"),
                    published: video.created_time || "",
                    thumbnail: video.picture || null,
                    videoUrl: video.source || null,
                    permalink: video.permalink_url || page.link || "https://www.facebook.com/",
                    accountName: page.name || "Facebook",
                  })),
              ),
            );
          }

          const instagram = page.instagram_business_account;
          if (instagram?.id) {
            requests.push(
              graphGet<GraphList<GraphInstagramVideo>>(
                `${instagram.id}/media`,
                pageToken,
                "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username",
              ).then((result) =>
                (result.data ?? [])
                  .filter((video) => video.id && video.media_type === "VIDEO" && video.permalink)
                  .map((video) => ({
                    id: `instagram-${video.id}`,
                    platform: "instagram" as const,
                    title: summary(video.caption, "Instagram video"),
                    published: video.timestamp || "",
                    thumbnail: video.thumbnail_url || null,
                    videoUrl: video.media_url || null,
                    permalink: video.permalink || "https://www.instagram.com/",
                    accountName: video.username ? `@${video.username}` : "Instagram",
                  })),
              ),
            );
          }

          const results = await Promise.allSettled(requests);
          return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
        }),
      );

      const videos = groups
        .flat()
        .sort((a, b) => Date.parse(b.published || "0") - Date.parse(a.published || "0"))
        .slice(0, 24);

      return {
        configured: true,
        videos,
        profiles: profiles.filter(
          (profile, index, all) => all.findIndex((item) => item.url === profile.url) === index,
        ),
        notice: videos.length ? null : "No public Facebook or Instagram videos were found yet.",
      };
    } catch (error) {
      console.error("Meta video feed failed:", error instanceof Error ? error.message : error);
      return {
        configured: true,
        videos: [],
        profiles: [],
        notice: "The social video feed is temporarily unavailable. Please visit our social pages.",
      };
    }
  });
});