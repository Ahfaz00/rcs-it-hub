import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Trash2, Inbox, Copy, RefreshCw, CheckCheck } from "lucide-react";
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
import {
  getWhatsappInboxConfig,
  listWhatsappInbox,
  deleteWhatsappInboxRow,
  attachFrameToProduct,
} from "@/lib/whatsapp-inbox.functions";

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
  const [copied, setCopied] = useState(false);

  const parse = useServerFn(parseWhatsappPosts);
  const deleteRow = useServerFn(deleteWhatsappInboxRow);

  const queryClient = useQueryClient();

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

  const inboxConfig = useServerFn(getWhatsappInboxConfig);
  const { data: config } = useQuery({
    queryKey: ["whatsapp-inbox-config"],
    queryFn: () => inboxConfig(),
    staleTime: 60 * 1000,
  });

  const inboxList = useServerFn(listWhatsappInbox);
  const inboxQuery = useQuery({
    queryKey: ["whatsapp-inbox-list"],
    queryFn: () => inboxList({ data: { limit: 20 } }),
    staleTime: 30 * 1000,
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

  async function copyInbox() {
    const token = config?.token;
    const url = config?.url;
    if (!token || !url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Select the link and copy manually.");
    }
  }

  async function handleDeleteRow(id: string) {
    try {
      await deleteRow({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["whatsapp-inbox-list"] });
      toast.success("Removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        title="WhatsApp import"
        description="Paste your WhatsApp channel post and turn it into product drafts."
      />

      {/* Auto-inbox (Zapier) */}
      <div className="mb-6 space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Inbox className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Auto-inbox (Zapier)</h3>
        </div>
        {config?.hasToken ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Send WhatsApp post text to this secret URL. New posts become draft products automatically
              (you still publish them from Products). Duplicates are skipped.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Input readOnly value={config.url} className="font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={copyInbox}>
                {copied ? <CheckCheck className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
                {copied ? "Copied" : "Copy URL"}
              </Button>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">Show secret token</summary>
              <code className="mt-1 block break-all rounded bg-muted px-2 py-1 font-mono">
                {config.token}
              </code>
            </details>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Inbox token is not set yet. Add a secret named <code>WHATSAPP_INBOX_TOKEN</code> to enable
            automatic imports.
          </p>
        )}
      </div>

      {/* Manual paste box */}
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

      {/* Recent auto-imports */}
      <div className="mt-8 space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent auto-imports</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => inboxQuery.refetch()}
            disabled={inboxQuery.isFetching}
          >
            <RefreshCw className={`mr-1 size-4 ${inboxQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        {(inboxQuery.data?.rows ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">No automatic imports yet.</p>
        ) : (
          <div className="space-y-2">
            {(inboxQuery.data?.rows ?? []).map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <StatusBadge status={row.status} />
                    <span className="text-muted-foreground">{row.products_created} draft(s)</span>
                    {row.source && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{row.source}</span>
                    )}
                    <span className="text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {row.error ? row.error : row.raw_text}
                  </p>
                  <InboxMedia media={row.media} productIds={row.product_ids} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => handleDeleteRow(row.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    done: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    no_products: "bg-slate-100 text-slate-600",
    error: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${map[status] ?? "bg-muted"}`}>
      {status.replace("_", " ")}
    </span>
  );
}


type InboxMediaItem = { kind: "image" | "video"; path: string };

function toMediaItems(value: unknown): InboxMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { kind, path } = item as { kind?: unknown; path?: unknown };
    if (typeof path !== "string" || !path) return [];
    return [{ kind: kind === "video" ? "video" : "image", path }];
  });
}

function toIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** Photos that came with the post, plus frame capture for post videos. */
function InboxMedia({ media, productIds }: { media: unknown; productIds: unknown }) {
  const items = toMediaItems(media);
  const ids = toIds(productIds);
  const saveFrame = useServerFn(attachFrameToProduct);
  const [busy, setBusy] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  if (!items.length) return null;
  const images = items.filter((i) => i.kind === "image");
  const videos = items.filter((i) => i.kind === "video");

  async function capture(path: string) {
    const video = videoRefs.current[path];
    if (!video) return;
    if (!ids.length) {
      toast.error("This post has no draft product to attach the photo to.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let dataUrl = "";
    try {
      dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    } catch {
      toast.error("This video frame could not be read.");
      return;
    }
    setBusy(true);
    try {
      for (const id of ids) {
        await saveFrame({ data: { productId: id, dataUrl } });
      }
      toast.success("Frame saved as the product photo.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the frame.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((item) => (
            <img
              key={item.path}
              src={`/api/media/${item.path}`}
              alt="Imported from the post"
              loading="lazy"
              className="size-16 rounded-md border border-border object-cover"
            />
          ))}
        </div>
      )}
      {videos.map((item) => (
        <div key={item.path} className="flex flex-wrap items-center gap-2">
          <video
            ref={(el) => {
              videoRefs.current[item.path] = el;
            }}
            src={`/api/media/${item.path}`}
            controls
            playsInline
            preload="metadata"
            className="h-28 rounded-md border border-border bg-muted"
          />
          <Button variant="outline" size="sm" disabled={busy} onClick={() => capture(item.path)}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Use this frame as photo
          </Button>
        </div>
      ))}
    </div>
  );
}
