import { useState } from "react";
import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Plus, Search, Trash2 } from "lucide-react";

import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getResource } from "@/lib/admin/resources";
import { logActivity } from "@/lib/admin/log";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/media";
import { formatDateTime } from "@/lib/format";

const PER_PAGE = 25;

export const Route = createFileRoute("/_authenticated/admin/$resource/")({
  beforeLoad: ({ params }) => {
    if (!getResource(params.resource)) throw notFound();
  },
  component: ResourceList,
});

type Row = Record<string, unknown> & { id: string };

function ResourceList() {
  const { resource } = Route.useParams();
  const config = getResource(resource)!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const queryKey = ["admin", resource, query, page];

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from(config.table as never)
        .select("*", { count: "exact" })
        .order(config.orderBy.column, { ascending: config.orderBy.ascending })
        .range(page * PER_PAGE, page * PER_PAGE + PER_PAGE - 1);

      if (query) {
        const safe = query.replace(/[%,()]/g, " ").trim();
        const filter = config.searchColumns.map((c) => `${c}.ilike.%${safe}%`).join(",");
        q = q.or(filter);
      }

      const { data: rows, count, error } = await q;
      if (error) throw error;
      return { rows: (rows ?? []) as unknown as Row[], count: count ?? 0 };
    },
  });

  async function toggleBoolean(row: Row, column: string) {
    const next = !row[column];
    const { error } = await supabase
      .from(config.table as never)
      .update({ [column]: next } as never)
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logActivity({
      action: next ? "enabled" : "disabled",
      entity_type: config.table,
      entity_id: row.id,
      entity_label: String(row["name"] ?? row["title"] ?? row["question"] ?? row.id),
    });
    queryClient.invalidateQueries({ queryKey: ["admin", resource] });
  }

  async function remove(row: Row) {
    const { error } = await supabase.from(config.table as never).delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logActivity({
      action: "deleted",
      entity_type: config.table,
      entity_id: row.id,
      entity_label: String(row["name"] ?? row["title"] ?? row["question"] ?? row.id),
    });
    toast.success(`${config.singular} deleted.`);
    queryClient.invalidateQueries({ queryKey: ["admin", resource] });
  }

  function exportCsv() {
    const rows = data?.rows ?? [];
    if (!rows.length) return;
    const headers = Object.keys(rows[0]!);
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.key}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const total = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminShell>
      <AdminHeader
        title={config.label}
        description={config.description}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={!data?.rows.length}>
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
            {config.canCreate === false ? null : (
              <Button asChild>
                <Link to="/admin/$resource/$id" params={{ resource, id: "new" }}>
                  <Plus className="mr-1.5 h-4 w-4" /> New
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setQuery(term);
        }}
        className="mb-4 flex gap-2"
      >
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}`}
            className="pl-9"
            aria-label={`Search ${config.label}`}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {query ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setTerm("");
              setQuery("");
              setPage(0);
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              {config.columns.map((c) => (
                <th key={c.name} className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending ? (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : data?.rows.length ? (
              data.rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/40">
                  {config.columns.map((c) => (
                    <td key={c.name} className="px-4 py-2.5 align-middle">
                      <Cell
                        row={row}
                        column={c}
                        resource={resource}
                        onToggle={() => toggleBoolean(row, c.name)}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigate({ to: "/admin/$resource/$id", params: { resource, id: row.id } })
                        }
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this {config.singular.toLowerCase()}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This cannot be undone. It will be removed from the website immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(row)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-muted-foreground">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} total</span>
        {pages > 1 ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span>
              Page {page + 1} of {pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page + 1 >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

function Cell({
  row,
  column,
  resource,
  onToggle,
}: {
  row: Row;
  column: { name: string; label: string; type?: string };
  resource: string;
  onToggle: () => void;
}) {
  const value = row[column.name];

  if (column.type === "boolean") {
    return <Switch checked={Boolean(value)} onCheckedChange={onToggle} aria-label={column.label} />;
  }
  if (column.type === "image") {
    const src = mediaUrl(typeof value === "string" ? value : null);
    return src ? (
      <img src={src} alt="" className="h-10 w-14 rounded border border-border object-cover" />
    ) : (
      <div className="h-10 w-14 rounded border border-dashed border-border" />
    );
  }
  if (column.type === "date") {
    return <span className="text-muted-foreground">{formatDateTime(String(value ?? ""))}</span>;
  }
  if (column.type === "badge") {
    return value ? <Badge variant="secondary">{String(value)}</Badge> : <span>-</span>;
  }
  const first = column.name === "name" || column.name === "title" || column.name === "question";
  if (first) {
    return (
      <Link
        to="/admin/$resource/$id"
        params={{ resource, id: row.id }}
        className="font-medium hover:text-accent"
      >
        {String(value ?? "-")}
      </Link>
    );
  }
  return <span className="text-muted-foreground">{value == null || value === "" ? "-" : String(value)}</span>;
}
