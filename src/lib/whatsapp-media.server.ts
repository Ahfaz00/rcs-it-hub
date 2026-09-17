import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type StoredMedia = { kind: "image"; path: string };

const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Pull image URLs out of a webhook payload (accepts strings, arrays or separated lists). */
export function collectMediaUrls(body: Record<string, unknown>): string[] {
  const keys = [
    "image_url",
    "image_urls",
    "images",
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

/** Download remote images and store them in the private "media" bucket. */
export async function storeRemoteMedia(
  client: SupabaseClient<Database>,
  urls: string[],
): Promise<StoredMedia[]> {
  const stored: StoredMedia[] = [];
  let images = 0;

  for (const url of urls) {
    if (images >= MAX_IMAGES) break;
    try {
      const res = await fetch(url, {
        headers: {
          // Some hosts (Wikimedia, CDNs) reject requests without a UA.
          "User-Agent": "RCS-Import/1.0 (+https://rcs-it-hub.lovable.app)",
          Accept: "image/*,*/*;q=0.5",
        },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const type = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
      if (!type.startsWith("image/")) continue;

      const buffer = new Uint8Array(await res.arrayBuffer());
      if (!buffer.byteLength) continue;
      if (buffer.byteLength > MAX_IMAGE_BYTES) continue;

      const ext = EXT_BY_TYPE[type] ?? "jpg";
      const path = `whatsapp/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await client.storage
        .from("media")
        .upload(path, buffer, { contentType: type, upsert: false });
      if (error) continue;

      stored.push({ kind: "image", path });
      images += 1;
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
