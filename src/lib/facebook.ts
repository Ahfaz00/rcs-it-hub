/** Normalises a pasted Facebook video/reel link to a clean URL, or null when invalid. */
export function cleanFacebookUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|web|mbasic)\./, "");
  if (host === "fb.watch") return `https://fb.watch${url.pathname.replace(/\/?$/, "/")}`;
  if (host !== "facebook.com") return null;
  const v = url.searchParams.get("v");
  if (v && /^\d+$/.test(v)) return `https://www.facebook.com/watch/?v=${v}`;
  const path = url.pathname.replace(/\/+$/, "");
  if (!/\/(videos|reel|watch|share\/v|share\/r)\b/.test(path)) return null;
  return `https://www.facebook.com${path}/`;
}
