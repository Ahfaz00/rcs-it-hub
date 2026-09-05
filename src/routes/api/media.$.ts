import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        // Prefer redirecting to a signed storage URL (needs the service role key,
        // available on Lovable Cloud). The file is then served by storage/CDN
        // directly instead of streaming through this worker.
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const signed = await supabaseAdmin.storage
            .from("media")
            .createSignedUrl(path, 60 * 60 * 24);
          if (signed.data?.signedUrl) {
            return new Response(null, {
              status: 302,
              headers: {
                location: signed.data.signedUrl,
                "cache-control": "public, max-age=43200",
              },
            });
          }
        } catch {
          // Service role key unavailable (e.g. external hosting) — fall through
          // to the publishable client below. A storage SELECT policy on the
          // media bucket allows public reads.
        }

        // Fallback: download with the publishable key and stream the bytes.
        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Not found", { status: 404 });

        const pub = createClient(url, key, {
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              if (headers.get("Authorization") === `Bearer ${key}`) {
                headers.delete("Authorization");
              }
              headers.set("apikey", key);
              return fetch(input, { ...init, headers });
            },
          },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await pub.storage.from("media").download(path);
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
