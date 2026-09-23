import { createFileRoute } from "@tanstack/react-router";

import { cleanInstagramUrl } from "@/lib/instagram";

async function resolveThumbnail(url: string): Promise<string | null> {
  const response = await fetch(
    `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`,
    { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8_000) },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { thumbnail_url?: unknown };
  return typeof data.thumbnail_url === "string" && data.thumbnail_url ? data.thumbnail_url : null;
}

export const Route = createFileRoute("/api/public/instagram-thumb")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const raw = new URL(request.url).searchParams.get("url") ?? "";
        const clean = cleanInstagramUrl(raw);
        if (!clean) return new Response("Invalid Instagram link", { status: 400 });

        try {
          const thumbnail = await resolveThumbnail(clean);
          if (!thumbnail) return new Response("Thumbnail unavailable", { status: 404 });

          const image = await fetch(thumbnail, { signal: AbortSignal.timeout(10_000) });
          if (!image.ok || !image.body) return new Response("Thumbnail unavailable", { status: 404 });

          return new Response(image.body, {
            status: 200,
            headers: {
              "content-type": image.headers.get("content-type") ?? "image/jpeg",
              "cache-control": "public, max-age=86400, s-maxage=86400",
            },
          });
        } catch {
          return new Response("Thumbnail unavailable", { status: 502 });
        }
      },
    },
  },
});
