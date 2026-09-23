import { cleanInstagramUrl, instagramShortcode } from "./instagram";

export type InstagramMetadata = {
  url: string;
  title: string;
  caption: string | null;
};

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function metaContent(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([\\s\\S]*?)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([\\s\\S]*?)["'][^>]+property=["']${escaped}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return null;
}

function extractCaption(ogTitle: string | null, ogDescription: string | null): string | null {
  const titleCaption = ogTitle?.match(/ on Instagram:\s*[“"]([\s\S]*?)[”"]\s*$/i)?.[1];
  if (titleCaption?.trim()) return titleCaption.trim();

  const descriptionCaption = ogDescription?.match(/:\s*[“"]([\s\S]*?)[”"]\s*$/)?.[1];
  return descriptionCaption?.trim() || null;
}

function titleFromCaption(caption: string | null, fallback: string): string {
  const firstLine = caption
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) return fallback;
  return firstLine.length > 180 ? `${firstLine.slice(0, 177).trimEnd()}...` : firstLine;
}

export async function fetchInstagramMetadata(value: string): Promise<InstagramMetadata> {
  const url = cleanInstagramUrl(value);
  if (!url) throw new Error("Invalid Instagram reel or post link.");

  const fallback = `Instagram reel ${instagramShortcode(url) ?? "video"}`;
  try {
    const oembedResponse = await fetch(
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`,
      {
        headers: { "user-agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (oembedResponse.ok) {
      const oembed = (await oembedResponse.json()) as { title?: unknown };
      const caption = typeof oembed.title === "string" ? oembed.title.trim() : null;
      if (caption) return { url, title: titleFromCaption(caption, fallback), caption };
    }

    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Instagram returned ${response.status}.`);
    const html = await response.text();
    const caption = extractCaption(metaContent(html, "og:title"), metaContent(html, "og:description"));
    return { url, title: titleFromCaption(caption, fallback), caption };
  } catch {
    return { url, title: fallback, caption: null };
  }
}