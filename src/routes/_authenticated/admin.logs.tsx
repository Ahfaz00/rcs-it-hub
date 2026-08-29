import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  component: LogsPage,
});

function LogsPage() {
  const { data: logs, isPending } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AdminShell>
      <AdminHeader title="Activity log" description="Recent changes made through the admin panel." />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/60">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">When</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Item</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : logs?.length ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-4 py-2.5">{log.user_email ?? "-"}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {log.entity_label ?? log.entity_type ?? "-"}
                    {log.details ? ` · ${log.details}` : ""}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
