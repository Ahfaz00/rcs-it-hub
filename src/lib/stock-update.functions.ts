import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "@/lib/format";

export const normName = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

export type StockRow = {
  name: string;
  category: string | null;
  brand: string | null;
  processor_model: string | null;
  ram: string | null;
  storage_capacity: string | null;
  quantity: string | null;
  price: number | null;
  match_id: string | null;
};

export const parseStockList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ text: z.string().trim().min(5).max(40000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");
    const { parseDraftsFromText } = await import("@/lib/whatsapp-parse.server");
    const [cats, brands, prods] = await Promise.all([
      context.supabase.from("categories").select("name"),
      context.supabase.from("brands").select("name"),
      context.supabase.from("products").select("id, name, sku"),
    ]);
    const parsed = await parseDraftsFromText(
      data.text,
      (cats.data ?? []).map((c) => c.name),
      (brands.data ?? []).map((b) => b.name),
    );
    const byName = new Map<string, string>();
    for (const p of prods.data ?? []) {
      byName.set(normName(p.name), p.id);
      if (p.sku) byName.set(normName(p.sku), p.id);
    }
    const rows: StockRow[] = parsed.products.map((p) => ({
      name: p.name.trim(),
      category: p.category,
      brand: p.brand,
      processor_model: p.processor_model,
      ram: p.ram,
      storage_capacity: p.storage_capacity,
      quantity: p.quantity,
      price: p.price,
      match_id: byName.get(normName(p.name)) ?? null,
    }));
    return { rows, activeCount: (prods.data ?? []).length };
  });

const rowSchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.string().nullable(),
  brand: z.string().nullable(),
  processor_model: z.string().nullable(),
  ram: z.string().nullable(),
  storage_capacity: z.string().nullable(),
  quantity: z.string().nullable(),
  price: z.number().nonnegative().nullable(),
  match_id: z.string().uuid().nullable(),
});

const qtyNum = (q: string | null) => {
  const m = q?.match(/\d[\d,]*/);
  return m ? Number(m[0].replace(/,/g, "")) : 0;
};

export const publishStockList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ rows: z.array(rowSchema).min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: isAdmin } = await sb.rpc("is_admin");
    if (!isAdmin) throw new Error("Admin access required.");
    const [cats, brands] = await Promise.all([
      sb.from("categories").select("id, name"),
      sb.from("brands").select("id, name"),
    ]);
    const keep: string[] = [];
    let added = 0;
    let updated = 0;
    for (const r of data.rows) {
      const common = {
        price: r.price,
        show_price: false,
        stock_quantity: qtyNum(r.quantity),
        availability: "In Stock",
        is_active: true,
        processor_model: r.processor_model,
        ram: r.ram,
        storage_capacity: r.storage_capacity,
      };
      const catId = cats.data?.find((c) => c.name === r.category)?.id;
      const brandId = brands.data?.find((b) => b.name === r.brand)?.id;
      if (catId) Object.assign(common, { category_id: catId });
      if (brandId) Object.assign(common, { brand_id: brandId });
      if (r.match_id) {
        const { error } = await sb.from("products").update(common).eq("id", r.match_id);
        if (error) throw new Error(`${r.name}: ${error.message}`);
        keep.push(r.match_id);
        updated++;
      } else {
        const slug = `${slugify(r.name) || "product"}-${Math.random().toString(36).slice(2, 6)}`;
        const { data: ins, error } = await sb
          .from("products")
          .insert({ ...common, name: r.name, slug })
          .select("id")
          .single();
        if (error) throw new Error(`${r.name}: ${error.message}`);
        keep.push(ins.id);
        added++;
      }
    }
    // Every product not in the new list is removed from the catalogue completely.
    let oldQ = sb.from("products").select("id");
    if (keep.length) oldQ = oldQ.not("id", "in", `(${keep.join(",")})`);
    const { data: oldRows, error: oldErr } = await oldQ;
    if (oldErr) throw new Error(oldErr.message);
    const oldIds = (oldRows ?? []).map((r) => r.id);
    for (let i = 0; i < oldIds.length; i += 100) {
      const chunk = oldIds.slice(i, i + 100);
      await Promise.all([
        sb.from("product_images").delete().in("product_id", chunk),
        sb.from("product_usage_tags").delete().in("product_id", chunk),
        sb.from("collection_products").delete().in("product_id", chunk),
        sb.from("enquiries").update({ product_id: null }).in("product_id", chunk),
      ]);
      const { error: delErr } = await sb.from("products").delete().in("id", chunk);
      if (delErr) {
        // Fall back to hiding anything that cannot be deleted.
        await sb.from("products").update({ is_active: false, availability: "Out of Stock" }).in("id", chunk);
      }
    }
    const hidden = oldIds.length;
    await sb.from("activity_logs").insert({
      action: "stock list published",
      entity_type: "products",
      details: `${added} added, ${updated} updated, ${hidden} removed`,
      user_id: context.userId,
    });
    return { added, updated, hidden };
  });
