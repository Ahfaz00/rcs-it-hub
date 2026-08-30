import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Prefer redirecting to a signed storage URL: the file is then served by
        // storage/CDN directly instead of streaming through this worker.
        const signed = await supabaseAdmin.storage.from("media").createSignedUrl(path, 60 * 60 * 24);
        if (signed.data?.signedUrl) {
          return new Response(null, {
            status: 302,
            headers: {
              location: signed.data.signedUrl,
              "cache-control": "public, max-age=43200",
            },
          });
        }

        const { data, error } = await supabaseAdmin.storage.from("media").download(path);

        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
