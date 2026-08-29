import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { FieldInput } from "@/components/admin/FieldInput";
import { Button } from "@/components/ui/button";
import { getResource } from "@/lib/admin/resources";
import { logActivity } from "@/lib/admin/log";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/$resource/$id")({
  beforeLoad: ({ params }) => {
    if (!getResource(params.resource)) throw notFound();
  },
  component: ResourceEditor,
});

type Values = Record<string, unknown>;

function ResourceEditor() {
  const { resource, id } = Route.useParams();
  const config = getResource(resource)!;
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Values>({});
  const [busy, setBusy] = useState(false);
  const [touchedSlug, setTouchedSlug] = useState(false);

  const { data: row, isPending } = useQuery({
    queryKey: ["admin-row", resource, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(config.table as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Values | null;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (row) setValues(row);
  }, [row]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof config.fields>();
    for (const field of config.fields) {
      const key = field.group ?? "Details";
      map.set(key, [...(map.get(key) ?? []), field]);
    }
    return [...map.entries()];
  }, [config.fields]);

  function setValue(name: string, value: unknown) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (config.slugFrom === name && !touchedSlug && (isNew || !prev["slug"])) {
        next["slug"] = slugify(String(value ?? ""));
      }
      return next;
    });
    if (name === "slug") setTouchedSlug(true);
  }

  async function save() {
    for (const field of config.fields) {
      if (field.required && !String(values[field.name] ?? "").trim()) {
        toast.error(`${field.label} is required.`);
        return;
      }
    }

    const payload: Values = {};
    for (const field of config.fields) {
      if (field.name in values) {
        const v = values[field.name];
        payload[field.name] = v === "" ? null : v;
      }
    }

    setBusy(true);
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from(config.table as never)
          .insert(payload as never)
          .select("id")
          .single();
        if (error) throw error;
        const newId = (data as { id: string }).id;
        void logActivity({
          action: "created",
          entity_type: config.table,
          entity_id: newId,
          entity_label: String(payload["name"] ?? payload["title"] ?? payload["question"] ?? newId),
        });
        toast.success(`${config.singular} created.`);
        queryClient.invalidateQueries({ queryKey: ["admin", resource] });
        navigate({ to: "/admin/$resource/$id", params: { resource, id: newId } });
      } else {
        const { error } = await supabase
          .from(config.table as never)
          .update(payload as never)
          .eq("id", id);
        if (error) throw error;
        void logActivity({
          action: "updated",
          entity_type: config.table,
          entity_id: id,
          entity_label: String(payload["name"] ?? payload["title"] ?? payload["question"] ?? id),
        });
        toast.success("Saved.");
        queryClient.invalidateQueries({ queryKey: ["admin", resource] });
        queryClient.invalidateQueries({ queryKey: ["admin-row", resource, id] });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  if (!isNew && isPending) {
    return (
      <AdminShell>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </AdminShell>
    );
  }

  if (!isNew && !row) {
    return (
      <AdminShell>
        <AdminHeader title="Not found" description="This record no longer exists." />
        <Button asChild>
          <Link to="/admin/$resource" params={{ resource }}>
            Back to {config.label}
          </Link>
        </Button>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminHeader
        title={isNew ? `New ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`}
        description={config.description}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/$resource" params={{ resource }}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {groups.map(([group, fields]) => (
          <section key={group} className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {group}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.type === "textarea" || field.type === "richtext" || field.type === "tags"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <FieldInput
                    field={field}
                    value={values[field.name]}
                    onChange={(v) => setValue(field.name, v)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-border bg-surface/90 py-4 backdrop-blur">
        <Button onClick={save} disabled={busy} size="lg">
          {busy ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </AdminShell>
  );
}
