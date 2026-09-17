import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type StoredMedia = { kind: "image" | "video"; path: string };

const MAX_IMAGES = 6;
const MAX_VIDEOS = 2;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 45 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/3gpp": "3gp",
};

/** Pull image/video URLs out of a webhook payload (accepts strings, arrays or separated lists). */
export function collectMediaUrls(body: Record<string, unknown>): string[] {
  const keys = [
    "image_url",
    "image_urls",
    "images",
    "video_url",
    "video_urls",
    "videos",
    "media",
    "media_urls",
    "attachments",
    "attachment",
  ];
  const out: string[] = [];
  for (const key of keys) {
    const value = body[key];
    if (!value) continue;
    const items = Array.isArray(value) ? value : [value];
    for (const item of items) {
      if (typeof item === "string") {
        for (const part of item.split(/[\s,]+/)) {
          const url = part.trim();
          if (/^https?:\/\//i.test(url)) out.push(url);
        }
      } else if (item && typeof item === "object") {
        const url = (item as { url?: unknown }).url;
        if (typeof url === "string" && /^https?:\/\//i.test(url.trim())) out.push(url.trim());
      }
    }
  }
  return Array.from(new Set(out));
}

/** Download remote media and store it in the private "media" bucket. */
export async function storeRemoteMedia(
  client: SupabaseClient<Database>,
  urls: string[],
): Promise<StoredMedia[]> {
  const stored: StoredMedia[] = [];
  let images = 0;
  let videos = 0;

  for (const url of urls) {
    if (images >= MAX_IMAGES && videos >= MAX_VIDEOS) break;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const type = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
      const isImage = type.startsWith("image/");
      const isVideo = type.startsWith("video/");
      if (!isImage && !isVideo) continue;
      if (isImage && images >= MAX_IMAGES) continue;
      if (isVideo && videos >= MAX_VIDEOS) continue;

      const buffer = new Uint8Array(await res.arrayBuffer());
      if (!buffer.byteLength) continue;
      if (isImage && buffer.byteLength > MAX_IMAGE_BYTES) continue;
      if (isVideo && buffer.byteLength > MAX_VIDEO_BYTES) continue;

      const ext = EXT_BY_TYPE[type] ?? (isImage ? "jpg" : "mp4");
      const path = `whatsapp/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await client.storage
        .from("media")
        .upload(path, buffer, { contentType: type, upsert: false });
      if (error) continue;

      stored.push({ kind: isImage ? "image" : "video", path });
      if (isImage) images += 1;
      else videos += 1;
    } catch {
      /* skip unreachable media, keep importing the rest */
    }
  }

  return stored;
}

/** Attach stored image paths to a draft product (first one becomes the main image). */
export async function attachImagesToProduct(
  client: SupabaseClient<Database>,
  productId: string,
  paths: string[],
  altText: string,
): Promise<void> {
  if (!paths.length) return;

  await client
    .from("products")
    .update({ main_image_url: paths[0]!, main_image_alt: altText })
    .eq("id", productId);

  await client.from("product_images").insert(
    paths.map((path, index) => ({
      product_id: productId,
      image_url: path,
      alt_text: altText,
      is_main: index === 0,
      sort_order: index,
    })),
  );
}
