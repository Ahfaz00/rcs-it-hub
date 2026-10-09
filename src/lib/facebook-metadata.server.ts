import { cleanFacebookUrl } from "./facebook";

export type FacebookMetadata = {
  url: string;
  title: string;
  caption: string | null;
  thumbnail: string | null;
};

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, c: string) => String.fromCodePoint(Number(c)))
    .replace(/&#x([\da-f]+);/gi, (_, c: string) => String.fromCodePoint(Number.parseInt(c, 16)));
}

function meta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property.replace(".", "\\.")}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const m = html.match(re);
  return m?.[1] ? decodeHtml(m[1]).trim() : null;
}

function firstLine(text: string | null): string | null {
  const line = text?.split(/\r?\n/).map((l) => l.trim()).find(Boolean);
  if (!line) return null;
  return line.length > 180 ? `${line.slice(0, 177).trimEnd()}...` : line;
}

export async function fetchFacebookMetadata(value: string): Promise<FacebookMetadata> {
  const url = cleanFacebookUrl(value);
  if (!url) throw new Error("Invalid Facebook video link.");
  const fallback = "Facebook video";
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "facebookexternalhit/1.1", accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { url, title: fallback, caption: null, thumbnail: null };
    const html = await res.text();
    const description = meta(html, "og:description");
    let ogTitle = meta(html, "og:title")?.replace(/\s*\|\s*Facebook\s*$/i, "") ?? null;
    // Generic page titles carry no information about the video.
    if (ogTitle && /^(facebook|watch|video|reels?)$/i.test(ogTitle)) ogTitle = null;
    const caption = description || null;
    const title = firstLine(caption) || firstLine(ogTitle) || fallback;
    return { url, title, caption, thumbnail: meta(html, "og:image") };
  } catch {
    return { url, title: fallback, caption: null, thumbnail: null };
  }
}
