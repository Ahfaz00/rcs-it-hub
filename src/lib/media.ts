/**
 * Media stored in the private "media" bucket is served through the
 * /api/media/<path> proxy so pages can use plain <img src>.
 *
 * The proxy URL is absolute (pointing at the primary deployment) so images
 * keep loading even when the static site is mirrored to external hosting
 * (e.g. Vercel/GitHub) where the /api/media route and Lovable asset CDN
 * paths do not exist.
 */
const MEDIA_ORIGIN = "https://rcs-it-hub.lovable.app";

/** Convert a Lovable CDN asset path (/__l5e/...) into an absolute URL. */
export function assetCdnUrl(path: string): string {
  if (/^(https?:)?\/\//i.test(path)) return path;
  return `${MEDIA_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function mediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("/__l5e/")) return assetCdnUrl(trimmed);
  if (trimmed.startsWith("/")) return trimmed; // real file in public/
  return `${MEDIA_ORIGIN}/api/media/${trimmed.replace(/^media\//, "")}`;
}
