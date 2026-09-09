import { createFileRoute } from "@tanstack/react-router";

const STATIC_PATHS = [
  "/",
  "/products",
  "/services",
  "/about",
  "/contact",
  "/bulk-orders",
  "/gallery",
  "/faq",
  "/blog",
  "/collections",
  "/brands",
  "/videos",
  "/search",
  "/compare",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { createPublicServerClient } = await import("@/lib/supabase-public.server");
        const supabase = createPublicServerClient();

        const [products, services, pages, posts, collections, brands] = await Promise.all([
          supabase.from("products").select("slug, updated_at").eq("is_active", true),
          supabase.from("services").select("slug, updated_at").eq("is_active", true),
          supabase.from("pages").select("slug, updated_at").eq("is_published", true),
          supabase
            .from("blog_posts")
            .select("slug, updated_at")
            .eq("is_published", true),
          supabase.from("collections").select("slug, updated_at").eq("is_active", true),
          supabase.from("brands").select("slug, updated_at").eq("is_active", true),
        ]);

        const urls: { loc: string; lastmod?: string }[] = [
          ...STATIC_PATHS.map((p) => ({ loc: `${origin}${p}` })),
          ...(products.data ?? []).map((p) => ({
            loc: `${origin}/products/${p.slug}`,
            lastmod: p.updated_at,
          })),
          ...(services.data ?? []).map((s) => ({
            loc: `${origin}/services/${s.slug}`,
            lastmod: s.updated_at,
          })),
          ...(pages.data ?? [])
            .filter((p) => p.slug !== "about")
            .map((p) => ({ loc: `${origin}/policies/${p.slug}`, lastmod: p.updated_at })),
          ...(posts.data ?? []).map((p) => ({
            loc: `${origin}/blog/${p.slug}`,
            lastmod: p.updated_at,
          })),
          ...(collections.data ?? []).map((c) => ({
            loc: `${origin}/collections/${c.slug}`,
            lastmod: c.updated_at,
          })),
          ...(brands.data ?? []).map((b) => ({
            loc: `${origin}/brands/${b.slug}`,
            lastmod: b.updated_at,
          })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
