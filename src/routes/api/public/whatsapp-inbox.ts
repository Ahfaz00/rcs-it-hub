import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

export const Route = createFileRoute("/api/public/whatsapp-inbox")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["WHATSAPP_INBOX_TOKEN"];
        if (!expected) {
          return Response.json({ ok: false, error: "Inbox is not configured." }, { status: 503 });
        }

        let body: { token?: string; text?: string; source?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
        }

        const token = typeof body.token === "string" ? body.token : "";
        const a = createHmac("sha256", "rcs-inbox").update(token).digest();
        const b = createHmac("sha256", "rcs-inbox").update(expected).digest();
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
        }

        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (text.length < 10 || text.length > 20000) {
          return Response.json(
            { ok: false, error: "Text must be between 10 and 20000 characters." },
            { status: 422 },
          );
        }

        const source = typeof body.source === "string" && body.source.length <= 120 ? body.source : "zapier";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // De-duplicate: skip identical text already processed.
        const { data: existing } = await supabaseAdmin
          .from("whatsapp_inbox")
          .select("id")
          .eq("raw_text", text)
          .limit(1);
        if (existing && existing.length) {
          return Response.json({
            ok: true,
            duplicate: true,
            message: "This post was already imported.",
            products: [],
          });
        }

        // Taxonomy lists for the AI to pick category/brand.
        const [cats, brands] = await Promise.all([
          supabaseAdmin.from("categories").select("name").order("name"),
          supabaseAdmin.from("brands").select("name").order("name"),
        ]);

        let status = "done";
        let productsCreated = 0;
        let errorMsg: string | null = null;
        let products: { name: string }[] = [];

        try {
          const { products: drafts } = await parseDraftsFromText(
            text,
            (cats.data ?? []).map((c) => c.name),
            (brands.data ?? []).map((b) => b.name),
          );
          products = drafts.map((d) => ({ name: d.name }));
          if (drafts.length) {
            const { created } = await insertDraftProducts(supabaseAdmin, drafts);
            productsCreated = created;
          } else {
            status = "no_products";
          }
        } catch (err) {
          status = "error";
          errorMsg = err instanceof Error ? err.message : "Unknown error";
        }

        await supabaseAdmin.from("whatsapp_inbox").insert({
          raw_text: text,
          source,
          status,
          products_created: productsCreated,
          error: errorMsg,
          processed_at: new Date().toISOString(),
        });

        return Response.json({
          ok: status !== "error",
          duplicate: false,
          status,
          products_created: productsCreated,
          products,
        });
      },
    },
  },
});
