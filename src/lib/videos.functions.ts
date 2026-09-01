import { createServerFn } from "@tanstack/react-start";

import { cached } from "./cache.server";

export type ChannelVideo = {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  url: string;
};

const CHANNEL_ID = "UCxXvFK0r-dItz1GF2ce1d_Q";

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m || !m[1]) return "";
  return m[1]
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export const listChannelVideos = createServerFn({ method: "GET" }).handler(async () => {
  return cached<ChannelVideo[]>("yt-videos", 30 * 60 * 1000, async () => {
    try {
      const res = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
        { headers: { "user-agent": "Mozilla/5.0 (compatible; RCSBot/1.0)" } },
      );
      if (!res.ok) return [];
      const xml = await res.text();
      const entries = xml.split("<entry>").slice(1);
      return entries
        .map((block) => {
          const id = pick(block, "yt:videoId");
          return {
            id,
            title: pick(block, "title"),
            published: pick(block, "published"),
            thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${id}`,
          };
        })
        .filter((v) => v.id);
    } catch {
      return [];
    }
  });
});
