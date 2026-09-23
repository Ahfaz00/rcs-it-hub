import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  urls: z.array(z.string().trim().min(1)).min(1).max(100),
});

export const getInstagramMetadata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("is_admin");
    if (error || !isAdmin) throw new Error("Admin access required.");

    const { fetchInstagramMetadata } = await import("./instagram-metadata.server");
    return Promise.all(data.urls.map((url) => fetchInstagramMetadata(url)));
  });