import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cached } from "./cache.server";

const PRODUCT_CARD_FIELDS =
  "id, name, slug, sku, short_description, condition, grade, processor_model, ram, storage_capacity, operating_system, display_size, price, mrp, discount, show_price, availability, stock_quantity, warranty, is_featured, is_new_arrival, is_best_seller, main_image_url, main_image_alt, created_at, brands(name, slug), categories(name, slug)";

/* ---------------------------------- nav ---------------------------------- */

export const getNavigationData = createServerFn({ method: "GET" }).handler(async () =>
  cached("nav", 300000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const [categories, brands, collections, usageTags, products] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, icon, parent_id, image_url, short_description, sort_order, is_featured")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("brands")
        .select("id, name, slug, logo_url")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("collections")
        .select("id, name, slug, kind, short_description, image_url, is_featured, sort_order")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("usage_tags")
        .select("id, name, slug, icon, short_description, image_url")
        .eq("is_active", true)
        .order("sort_order"),
      supabase.from("products").select("category_id, brand_id").eq("is_active", true),
    ]);

    const countByCategory: Record<string, number> = {};
    const countByBrand: Record<string, number> = {};
    for (const p of products.data ?? []) {
      if (p.category_id) countByCategory[p.category_id] = (countByCategory[p.category_id] ?? 0) + 1;
      if (p.brand_id) countByBrand[p.brand_id] = (countByBrand[p.brand_id] ?? 0) + 1;
    }

    const all = categories.data ?? [];
    const tree = all
      .filter((c) => !c.parent_id)
      .map((c) => ({
        ...c,
        productCount: countByCategory[c.id] ?? 0,
        children: all
          .filter((child) => child.parent_id === c.id)
          .map((child) => ({ ...child, productCount: countByCategory[child.id] ?? 0 })),
      }));

    return {
      categories: tree,
      brands: (brands.data ?? []).map((b) => ({ ...b, productCount: countByBrand[b.id] ?? 0 })),
      collections: collections.data ?? [],
      usageTags: usageTags.data ?? [],
    };
  }),
);

/* ------------------------------- collections ------------------------------ */

type Rules = { type?: string; min?: number; max?: number };

export const listCollections = createServerFn({ method: "GET" }).handler(async () =>
  cached("collections", 300000, async () => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  }),
);

export const getCollection = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) =>
    cached(`collection:${data.slug}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const { data: collection } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", data.slug)
        .eq("is_active", true)
        .maybeSingle();
      if (!collection) return null;

      const rules = (collection.rules ?? {}) as Rules;
      let products: unknown[] = [];

      if (collection.kind === "manual") {
        const { data: links } = await supabase
          .from("collection_products")
          .select(`sort_order, products(${PRODUCT_CARD_FIELDS})`)
          .eq("collection_id", collection.id)
          .order("sort_order");
        products = (links ?? [])
          .map((l) => l.products)
          .filter(Boolean)
          .filter((p) => (p as { is_active?: boolean }).is_active !== false);
      } else {
        let query = supabase.from("products").select(PRODUCT_CARD_FIELDS).eq("is_active", true);
        if (collection.kind === "budget") {
          query = query.eq("show_price", true).not("price", "is", null);
          if (typeof rules.max === "number") query = query.lte("price", rules.max);
          if (typeof rules.min === "number") query = query.gte("price", rules.min);
          query = query.order("price", { ascending: true });
        } else if (rules.type === "discount") {
          query = query.gt("discount", 0).order("discount", { ascending: false });
        } else if (rules.type === "bestseller") {
          query = query.eq("is_best_seller", true).order("sort_order");
        } else if (rules.type === "featured") {
          query = query.eq("is_featured", true).order("sort_order");
        } else {
          query = query.order("created_at", { ascending: false });
        }
        const { data: rows } = await query.limit(48);
        products = rows ?? [];
      }

      return { collection, products };
    }),
  );

/* ------------------------------- usage tags ------------------------------- */

export const getUsageTag = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) =>
    cached(`usage:${data.slug}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const { data: tag } = await supabase
        .from("usage_tags")
        .select("*")
        .eq("slug", data.slug)
        .eq("is_active", true)
        .maybeSingle();
      if (!tag) return null;

      const { data: links } = await supabase
        .from("product_usage_tags")
        .select(`products(${PRODUCT_CARD_FIELDS})`)
        .eq("usage_tag_id", tag.id);

      const products = (links ?? []).map((l) => l.products).filter(Boolean);
      return { tag, products };
    }),
  );

/* --------------------------------- brands --------------------------------- */

export const getBrandBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) =>
    cached(`brand:${data.slug}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();
      const { data: brand } = await supabase
        .from("brands")
        .select("*")
        .eq("slug", data.slug)
        .eq("is_active", true)
        .maybeSingle();
      if (!brand) return null;
      const { data: products } = await supabase
        .from("products")
        .select(PRODUCT_CARD_FIELDS)
        .eq("is_active", true)
        .eq("brand_id", brand.id)
        .order("is_featured", { ascending: false })
        .limit(48);
      return { brand, products: products ?? [] };
    }),
  );

/* --------------------------------- search --------------------------------- */

export const searchSuggest = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ term: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const term = data.term.replace(/[%,()]/g, " ").trim();
    if (term.length < 2) return { products: [], categories: [], brands: [] };

    return cached(`suggest:${term.toLowerCase()}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();
      const [products, categories, brands] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, slug, main_image_url, price, show_price, condition, brands(name)")
          .eq("is_active", true)
          .or(
            `name.ilike.%${term}%,sku.ilike.%${term}%,processor_model.ilike.%${term}%,short_description.ilike.%${term}%`,
          )
          .limit(6),
        supabase
          .from("categories")
          .select("name, slug")
          .eq("is_active", true)
          .ilike("name", `%${term}%`)
          .limit(4),
        supabase
          .from("brands")
          .select("name, slug")
          .eq("is_active", true)
          .ilike("name", `%${term}%`)
          .limit(4),
      ]);
      return {
        products: products.data ?? [],
        categories: categories.data ?? [],
        brands: brands.data ?? [],
      };
    });
  });

export const logSearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ term: z.string().min(1).max(120), results: z.number().int().min(0) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    await supabase
      .from("search_queries")
      .insert({ term: data.term.trim().toLowerCase(), results_count: data.results });
    return { ok: true };
  });

/* -------------------------------- compare --------------------------------- */

export const getProductsByIds = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ ids: z.array(z.string().uuid()).max(8) }).parse(data))
  .handler(async ({ data }) => {
    if (!data.ids.length) return [];
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data: rows } = await supabase
      .from("products")
      .select(
        "id, name, slug, main_image_url, main_image_alt, condition, grade, price, mrp, discount, show_price, availability, warranty, processor_brand, processor_model, processor_generation, cpu_cores, ram, ram_type, storage_type, storage_capacity, display_size, display_resolution, graphics_type, gpu_model, operating_system, ports, weight, brands(name)",
      )
      .in("id", data.ids)
      .eq("is_active", true);
    return rows ?? [];
  });

/* ---------------------------------- blog ---------------------------------- */

export const listBlogPosts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ category: z.string().optional(), limit: z.number().int().min(1).max(48).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data }) =>
    cached(`blog:${JSON.stringify(data)}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();
      let query = supabase
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, cover_image_url, cover_image_alt, author_name, reading_minutes, published_at, is_featured, blog_categories(name, slug)",
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(data.limit ?? 24);

      if (data.category) {
        const { data: cat } = await supabase
          .from("blog_categories")
          .select("id")
          .eq("slug", data.category)
          .maybeSingle();
        query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
      }

      const [posts, categories] = await Promise.all([
        query,
        supabase.from("blog_categories").select("name, slug").eq("is_active", true).order("sort_order"),
      ]);
      return { posts: posts.data ?? [], categories: categories.data ?? [] };
    }),
  );

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data: post } = await supabase
      .from("blog_posts")
      .select("*, blog_categories(name, slug)")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!post) return null;
    const { data: related } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, published_at")
      .eq("is_published", true)
      .neq("id", post.id)
      .limit(3);
    return { post, related: related ?? [] };
  });

/* ------------------------------- submissions ------------------------------ */

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({ email: z.string().email(), name: z.string().max(120).optional(), source: z.string().max(60).optional() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: data.email.toLowerCase(),
      name: data.name ?? null,
      source: data.source ?? "website",
    });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const submitProductRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        product_name: z.string().min(2).max(200),
        quantity: z.string().max(60).optional(),
        budget: z.string().max(60).optional(),
        name: z.string().min(2).max(120),
        phone: z.string().min(6).max(20),
        email: z.string().email().optional().or(z.literal("")),
        message: z.string().max(2000).optional(),
        source: z.string().max(60).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { error } = await supabase.from("product_requests").insert({
      product_name: data.product_name,
      name: data.name,
      phone: data.phone,
      quantity: data.quantity ?? null,
      budget: data.budget ?? null,
      message: data.message ?? null,
      email: data.email || null,
      source: data.source ?? "search",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------- banners --------------------------------- */

export const listBanners = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ placement: z.string().default("hero") }).parse(data ?? {}))
  .handler(async ({ data }) =>
    cached(`banners:${data.placement}`, 60000, async () => {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();
      const nowIso = new Date().toISOString();
      const { data: rows } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("placement", data.placement)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
        .order("sort_order");
      return rows ?? [];
    }),
  );
