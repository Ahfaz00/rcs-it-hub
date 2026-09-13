import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";
import { logActivity } from "@/lib/admin/log";
import { CONDITIONS } from "@/lib/admin/resources";
import { parseWhatsappPosts, type ParsedProductDraft } from "@/lib/whatsapp-import.functions";

export const Route = createFileRoute("/_authenticated/admin/whatsapp-import")({
  component: WhatsappImportPage,
});

type Draft = ParsedProductDraft & { _id: string; _keep: boolean };

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function WhatsappImportPage() {
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const parse = useServerFn(parseWhatsappPosts);

  const { data: taxonomy } = useQuery({
    queryKey: ["import-taxonomy"],
    queryFn: async () => {
      const [cats, brands] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("brands").select("id, name").order("name"),
      ]);
      return { categories: cats.data ?? [], brands: brands.data ?? [] };
    },
    staleTime: 5 * 60 * 1000,
  });

  async function handleParse() {
    if (text.trim().length < 10) {
      toast.error("Paste a WhatsApp post first.");
      return;
    }
    setParsing(true);
    try {
      const res = await parse({
        data: {
          text,
          categories: (taxonomy?.categories ?? []).map((c) => c.name),
          brands: (taxonomy?.brands ?? []).map((b) => b.name),
        },
      });
      const list = res.products.map((p, i) => ({
        ...p,
        _id: `${Date.now()}-${i}`,
        _keep: true,
      }));
      setDrafts(list);
      if (!list.length) toast.error("No products found in that text.");
      else toast.success(`${list.length} product${list.length > 1 ? "s" : ""} found. Check and save.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that text.");
    } finally {
      setParsing(false);
    }
  }

  function update(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d) => (d._id === id ? { ...d, ...patch } : d)));
  }

  async function handleSave() {
    const selected = drafts.filter((d) => d._keep && d.name.trim());
    if (!selected.length) {
      toast.error("Select at least one product.");
      return;
    }
    setSaving(true);
    let created = 0;
    try {
      for (const d of selected) {
        const category = taxonomy?.categories.find((c) => c.name === d.category);
        const brand = taxonomy?.brands.find((b) => b.name === d.brand);
        const base = slugify(d.name) || "product";
        const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

        const { error } = await supabase.from("products").insert({
          name: d.name.trim(),
          slug,
          category_id: category?.id ?? null,
          brand_id: brand?.id ?? null,
          condition: d.condition,
          product_type: d.product_type,
          processor_model: d.processor_model,
          ram: d.ram,
          storage_capacity: d.storage_capacity,
          display_size: d.display_size,
          operating_system: d.operating_system,
          short_description: d.short_description,
          description: d.quantity ? `Available quantity: ${d.quantity}` : null,
          price: d.price,
          show_price: d.price != null,
          availability: "Enquire for Availability",
          is_active: false,
        });
        if (error) throw new Error(error.message);
        created += 1;
      }
      await logActivity({
        action: "import",
        entity_type: "products",
        details: `Imported ${created} product draft(s) from a WhatsApp post`,
      });
      toast.success(`${created} draft product${created > 1 ? "s" : ""} created. Publish them from Products.`);
      setDrafts([]);
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the products.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        title="WhatsApp import"
        description="Paste your WhatsApp channel post and turn it into product drafts."
      />

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <Label htmlFor="wa-text">WhatsApp post text</Label>
        <Textarea
          id="wa-text"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste one or more posts here, e.g.\n\nDell Latitude 5490 i5 8th Gen 8GB 256GB SSD 14 inch - 25 pcs available"}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleParse} disabled={parsing}>
            {parsing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            {parsing ? "Reading post..." : "Read post"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Nothing is published automatically - everything is created as a draft for you to review.
          </p>
        </div>
      </div>

      {drafts.length > 0 && (
        <div className="mt-6 space-y-4">
          {drafts.map((d) => (
            <div key={d._id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-2 size-4"
                  checked={d._keep}
                  onChange={(e) => update(d._id, { _keep: e.target.checked })}
                  aria-label="Include this product"
                />
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Product name</Label>
                    <Input value={d.name} onChange={(e) => update(d._id, { name: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <select
                      className={selectClass}
                      value={d.category ?? ""}
                      onChange={(e) => update(d._id, { category: e.target.value || null })}
                    >
                      <option value="">Not set</option>
                      {(taxonomy?.categories ?? []).map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Brand</Label>
                    <select
                      className={selectClass}
                      value={d.brand ?? ""}
                      onChange={(e) => update(d._id, { brand: e.target.value || null })}
                    >
                      <option value="">Not set</option>
                      {(taxonomy?.brands ?? []).map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Condition</Label>
                    <select
                      className={selectClass}
                      value={d.condition ?? ""}
                      onChange={(e) => update(d._id, { condition: e.target.value || null })}
                    >
                      <option value="">Not set</option>
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Price (blank = Contact for Price)</Label>
                    <Input
                      type="number"
                      value={d.price ?? ""}
                      onChange={(e) =>
                        update(d._id, { price: e.target.value === "" ? null : Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Processor</Label>
                    <Input
                      value={d.processor_model ?? ""}
                      onChange={(e) => update(d._id, { processor_model: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">RAM</Label>
                    <Input value={d.ram ?? ""} onChange={(e) => update(d._id, { ram: e.target.value || null })} />
                  </div>
                  <div>
                    <Label className="text-xs">Storage</Label>
                    <Input
                      value={d.storage_capacity ?? ""}
                      onChange={(e) => update(d._id, { storage_capacity: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      value={d.quantity ?? ""}
                      onChange={(e) => update(d._id, { quantity: e.target.value || null })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Short description</Label>
                    <Textarea
                      rows={2}
                      value={d.short_description ?? ""}
                      onChange={(e) => update(d._id, { short_description: e.target.value || null })}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => setDrafts((prev) => prev.filter((x) => x._id !== d._id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create draft products
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/$resource" params={{ resource: "products" }}>
                Go to products
              </Link>
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
