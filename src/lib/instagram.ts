const INSTAGRAM_PATTERN = /instagram\.com\/(?:[^/\s]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i;

/** Normalises any pasted Instagram link to a clean canonical URL, or null when invalid. */
export function cleanInstagramUrl(value: string): string | null {
  const match = INSTAGRAM_PATTERN.exec(value.trim());
  if (!match) return null;
  const kind = match[1]!.toLowerCase() === "reels" ? "reel" : match[1]!.toLowerCase();
  return `https://www.instagram.com/${kind}/${match[2]}/`;
}

export function instagramShortcode(value: string): string | null {
  const match = INSTAGRAM_PATTERN.exec(value);
  return match ? match[2]! : null;
}

/** Embed URL that renders the reel/post without any API token. */
export function instagramEmbedUrl(value: string): string | null {
  const clean = cleanInstagramUrl(value);
  return clean ? `${clean}embed/captioned` : null;
}
