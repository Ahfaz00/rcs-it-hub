/**
 * Media stored in the private "media" bucket is served through the
 * /api/media/<path> proxy so pages can use plain <img src>.
 * Absolute URLs and root-relative asset URLs pass through untouched.
 */
export function mediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/api/media/${trimmed.replace(/^media\//, "")}`;
}
