import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestUrl } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type WhatsappInboxRow = Database["public"]["Tables"]["whatsapp_inbox"]["Row"];

export type InboxConfig = {
  hasToken: boolean;
  token: string | null;
  url: string;
};

function originFromRequest(): string {
  try {
    const u = getRequestUrl();
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

/** Returns the secret inbox URL + token so the admin can copy it into Zapier. */
export const getWhatsappInboxConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");

    const token = process.env["WHATSAPP_INBOX_TOKEN"] ?? null;
    const origin = originFromRequest();
    const path = token ? `/api/public/whatsapp-inbox` : "";
    return {
      hasToken: Boolean(token),
      token,
      url: origin ? `${origin}${path}` : path,
    } satisfies InboxConfig;
  });

const listSchema = z.object({ limit: z.number().int().min(1).max(50).default(20) });

/** Recent auto-import attempts (newest first). */
export const listWhatsappInbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");

    const { data: rows, error } = await context.supabase
      .from("whatsapp_inbox")
      .select(
        "id, raw_text, source, status, products_created, media, product_ids, error, created_at, processed_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as WhatsappInboxRow[] };
  });

/** Delete an inbox log row. */
export const deleteWhatsappInboxRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");

    const { error } = await context.supabase.from("whatsapp_inbox").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const frameSchema = z.object({
  productId: z.string().uuid(),
  dataUrl: z.string().max(12_000_000),
});

/** Save a frame captured from a post video as the product's photo. */
export const attachFrameToProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => frameSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");

    const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data.dataUrl);
    if (!match) throw new Error("That frame could not be read.");
    const contentType = match[1]!;
    const bytes = Uint8Array.from(atob(match[2]!), (c) => c.charCodeAt(0));
    if (!bytes.byteLength) throw new Error("That frame is empty.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const path = `whatsapp/frame-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("media")
      .upload(path, bytes, { contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("name")
      .eq("id", data.productId)
      .maybeSingle();

    const { attachImagesToProduct } = await import("@/lib/whatsapp-media.server");
    await attachImagesToProduct(supabaseAdmin, data.productId, [path], product?.name ?? "Product photo");

    return { ok: true, path };
  });
