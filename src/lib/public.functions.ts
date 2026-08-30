import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cached } from "./cache.server";

const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  type: z.string().optional(),
  featured: z.boolean().optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(48).optional(),
});

export type ProductFilters = z.infer<typeof productFilterSchema>;

export const getSiteData = createServerFn({ method: "GET" }).handler(async () =>
  cached("site", 300000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const [settings, categories, services] = await Promise.all([
      supabase.from("settings").select("key, value"),
      supabase
        .from("categories")
        .select("id, name, slug, icon, short_description, image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("services")
        .select("id, title, slug, icon, short_description, sort_order")
        .eq("is_active", true)
        .order("sort_order"),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const row of settings.data ?? []) settingsMap[row.key] = row.value ?? "";

    return {
      settings: settingsMap,
      categories: categories.data ?? [],
      services: services.data ?? [],
    };
  }),
);

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => productFilterSchema.parse(data ?? {}))
  .handler(async ({ data }) =>
    cached(`products:${JSON.stringify(data)}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const page = data.page ?? 1;
      const perPage = data.perPage ?? 12;

      let query = supabase
        .from("products")
        .select(
          "id, name, slug, sku, short_description, condition, grade, processor_model, ram, storage_capacity, operating_system, display_size, price, mrp, discount, show_price, availability, is_featured, main_image_url, main_image_alt, created_at, warranty, brands(name, slug), categories(name, slug)",
          { count: "exact" },
        )
        .eq("is_active", true);

      if (data.search) {
        const term = data.search.replace(/[%,()]/g, " ").trim();
        if (term) {
          query = query.or(
            `name.ilike.%${term}%,short_description.ilike.%${term}%,processor_model.ilike.%${term}%,sku.ilike.%${term}%`,
          );
        }
      }
      if (data.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", data.category)
          .maybeSingle();
        query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
      }
      if (data.brand) {
        const { data: brand } = await supabase
          .from("brands")
          .select("id")
          .eq("slug", data.brand)
          .maybeSingle();
        query = query.eq("brand_id", brand?.id ?? "00000000-0000-0000-0000-000000000000");
      }
      if (data.condition) query = query.eq("condition", data.condition);
      if (data.type) query = query.eq("product_type", data.type);
      if (data.featured) query = query.eq("is_featured", true);

      switch (data.sort) {
        case "name-asc":
          query = query.order("name", { ascending: true });
          break;
        case "name-desc":
          query = query.order("name", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        default:
          query = query
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false });
      }
      query = query.order("id", { ascending: true });

      const from = (page - 1) * perPage;
      const { data: rows, count, error } = await query.range(from, from + perPage - 1);
      if (error) throw new Error(error.message);

      return { products: rows ?? [], total: count ?? 0, page, perPage };
    }),
  );

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) =>
    cached(`product:${JSON.stringify(data)}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const { data: product } = await supabase
        .from("products")
        .select("*, brands(name, slug), categories(name, slug)")
        .eq("slug", data.slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!product) return null;

      const [images, related] = await Promise.all([
        supabase
          .from("product_images")
          .select("id, image_url, alt_text, is_main, sort_order")
          .eq("product_id", product.id)
          .order("sort_order"),
        supabase
          .from("products")
          .select(
            "id, name, slug, short_description, condition, price, mrp, discount, show_price, main_image_url, main_image_alt, availability, warranty, processor_model, ram, storage_capacity, operating_system",
          )
          .eq("is_active", true)
          .eq("category_id", product.category_id ?? "")
          .neq("id", product.id)
          .limit(4),
      ]);

      return { product, images: images.data ?? [], related: related.data ?? [] };
    }),
  );

export const getCatalogFilters = createServerFn({ method: "GET" }).handler(async () =>
  cached("filters", 300000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const [categories, brands, products] = await Promise.all([
      supabase.from("categories").select("name, slug").eq("is_active", true).order("sort_order"),
      supabase.from("brands").select("name, slug").eq("is_active", true).order("sort_order"),
      supabase.from("products").select("condition, product_type").eq("is_active", true),
    ]);

    const conditions = [
      ...new Set((products.data ?? []).map((p) => p.condition).filter(Boolean) as string[]),
    ].sort();
    const types = [
      ...new Set((products.data ?? []).map((p) => p.product_type).filter(Boolean) as string[]),
    ].sort();

    return { categories: categories.data ?? [], brands: brands.data ?? [], conditions, types };
  }),
);

export const getHomeData = createServerFn({ method: "GET" }).handler(async () =>
  cached("home", 60000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const [featured, latest, testimonials, faqs, brands, gallery] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, name, slug, short_description, condition, price, mrp, discount, show_price, main_image_url, main_image_alt, availability, warranty, processor_model, ram, storage_capacity, operating_system, display_size, brands(name)",
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sort_order")
        .limit(8),
      supabase
        .from("products")
        .select(
          "id, name, slug, short_description, condition, price, mrp, discount, show_price, main_image_url, main_image_alt, availability, warranty, processor_model, ram, storage_capacity, operating_system, display_size, brands(name)",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order").limit(6),
      supabase.from("faqs").select("*").eq("is_active", true).order("sort_order").limit(6),
      supabase
        .from("brands")
        .select("name, slug, logo_url")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("gallery")
        .select("id, title, image_url, alt_text")
        .eq("is_active", true)
        .order("sort_order")
        .limit(8),
    ]);

    return {
      featured: featured.data ?? [],
      latest: latest.data ?? [],
      testimonials: testimonials.data ?? [],
      faqs: faqs.data ?? [],
      brands: brands.data ?? [],
      gallery: gallery.data ?? [],
    };
  }),
);

export const listServices = createServerFn({ method: "GET" }).handler(async () =>
  cached("services", 300000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  }),
);

export const getServiceBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data: service } = await supabase
      .from("services")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    return service;
  });

export const listFaqs = createServerFn({ method: "GET" }).handler(async () =>
  cached("faqs", 300000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  }),
);

export const listGallery = createServerFn({ method: "GET" }).handler(async () =>
  cached("gallery", 300000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  }),
);

export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data: page } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    return page;
  });
