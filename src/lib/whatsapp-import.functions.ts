import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseDraftsFromText, type ParsedProductDraft } from "@/lib/whatsapp-parse.server";

export type { ParsedProductDraft };

const inputSchema = z.object({
  text: z.string().trim().min(10, { message: "Paste at least one WhatsApp post." }).max(20000),
  categories: z.array(z.string()).max(100).default([]),
  brands: z.array(z.string()).max(100).default([]),
});

export const parseWhatsappPosts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");

    return parseDraftsFromText(data.text, data.categories, data.brands);
  });
