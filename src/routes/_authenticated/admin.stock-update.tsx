import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseStockList, publishStockList, type StockRow } from "@/lib/stock-update.functions";

export const Route = createFileRoute("/_authenticated/admin/stock-update")({
  component: StockUpdatePage,
});

function StockUpdatePage() {
  const parse = useServerFn(parseStockList);
  const publish = useServerFn(publishStockList);
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<StockRow[]>([]);
  const [busy, setBusy] = useState(false);

  async function read() {
    setBusy(true);
    try {
      const res = await parse({ data: { text } });
      setRows(res.rows);
      if (!res.rows.length) toast.error("No items found in that list.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read the list.");
    } finally {
      setBusy(false);
    }
  }

  async function doPublish() {
    const bad = rows.find((r) => r.name.trim().length < 2);
    if (bad) { toast.error("Every row needs a model name."); return; }
    if (!confirm("Publish this list? Products not in it will be hidden from the website.")) { return; }
    setBusy(true);
    try {
      const r = await publish({ data: { rows } });
      toast.success(`Published: ${r.added} new, ${r.updated} updated, ${r.hidden} hidden.`);
      setRows([]);
      setText("");
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  }

  const edit = (i: number, k: keyof StockRow, v: string) =>
    setRows((p) =>
      p.map((r, j) =>
        j !== i ? r : { ...r, [k]: k === "price" ? (v === "" ? null : Number(v) || null) : v || null },
      ),
    );

  const newCount = rows.filter((r) => !r.match_id).length;

  return (
    <AdminShell>
      <AdminHeader
        title="Stock list update"
        description="Paste your full stock list, check the preview, then publish. Items not in the new list are hidden from the website."
      />
      <div className="rounded-lg border border-border bg-card p-5">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste the stock list here (WhatsApp text, Excel copy, one item per line)…"
          aria-label="Stock list"
        />
        <Button className="mt-3" onClick={read} disabled={busy || text.trim().length < 5}>
          {busy && !rows.length ? "Reading…" : "Read list"}
        </Button>
      </div>

      {rows.length ? (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {rows.length} items: {newCount} new, {rows.length - newCount} update. Other website products will be hidden.
            </p>
            <Button onClick={doPublish} disabled={busy}>
              {busy ? "Publishing…" : "Publish to website"}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/60 text-left text-muted-foreground">
                <tr>
                  {["", "Model", "Category", "Brand", "Processor", "RAM", "Storage", "Qty", "Price (₹)", ""].map((h, i) => (
                    <th key={i} className="px-2 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5">
                      <Badge variant={r.match_id ? "secondary" : "default"}>{r.match_id ? "Update" : "New"}</Badge>
                    </td>
                    {(["name", "category", "brand", "processor_model", "ram", "storage_capacity", "quantity", "price"] as const).map((k) => (
                      <td key={k} className="px-1 py-1.5">
                        <Input
                          value={r[k] == null ? "" : String(r[k])}
                          onChange={(e) => edit(i, k, e.target.value)}
                          className={k === "name" ? "min-w-56" : "min-w-24"}
                          aria-label={k}
                        />
                      </td>
                    ))}
                    <td className="px-2">
                      <Button size="icon" variant="ghost" aria-label="Remove row" onClick={() => setRows((p) => p.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
