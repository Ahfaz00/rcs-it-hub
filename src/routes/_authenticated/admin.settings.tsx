import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logActivity } from "@/lib/admin/log";
import { supabase } from "@/integrations/supabase/client";

type SettingRow = { key: string; value: string | null; group_name: string; label: string | null };

const LONG_KEYS = ["address", "default_enquiry_message", "announcement_text", "footer_about", "hero_subtitle"];

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value, group_name, label")
        .order("group_name")
        .order("key");
      if (error) throw error;
      return (data ?? []) as SettingRow[];
    },
  });

  useEffect(() => {
    if (rows) setValues(Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""])));
  }, [rows]);

  const groups = useMemo(() => {
    const map = new Map<string, SettingRow[]>();
    for (const row of rows ?? []) {
      map.set(row.group_name, [...(map.get(row.group_name) ?? []), row]);
    }
    return [...map.entries()];
  }, [rows]);

  async function save() {
    setBusy(true);
    try {
      const updates = (rows ?? [])
        .filter((r) => (r.value ?? "") !== (values[r.key] ?? ""))
        .map((r) => ({ key: r.key, value: values[r.key] ?? "", group_name: r.group_name, label: r.label }));

      if (updates.length === 0) {
        toast.info("No changes to save.");
        return;
      }

      const { error } = await supabase.from("settings").upsert(updates, { onConflict: "key" });
      if (error) throw error;

      void logActivity({
        action: "updated",
        entity_type: "settings",
        details: `Updated ${updates.length} setting(s): ${updates.map((u) => u.key).join(", ")}`,
      });
      toast.success("Settings saved.");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        title="Settings"
        description="Business details, contact information and website behaviour."
        action={
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving..." : "Save settings"}
          </Button>
        }
      />

      <div className="space-y-6">
        {groups.map(([group, items]) => (
          <section key={group} className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {group}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {items.map((item) => {
                const long = LONG_KEYS.includes(item.key);
                return (
                  <div key={item.key} className={long ? "space-y-1.5 md:col-span-2" : "space-y-1.5"}>
                    <Label htmlFor={`setting-${item.key}`}>{item.label ?? item.key}</Label>
                    {long ? (
                      <Textarea
                        id={`setting-${item.key}`}
                        rows={3}
                        value={values[item.key] ?? ""}
                        onChange={(e) => setValues((p) => ({ ...p, [item.key]: e.target.value }))}
                      />
                    ) : (
                      <Input
                        id={`setting-${item.key}`}
                        value={values[item.key] ?? ""}
                        onChange={(e) => setValues((p) => ({ ...p, [item.key]: e.target.value }))}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">{item.key}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
