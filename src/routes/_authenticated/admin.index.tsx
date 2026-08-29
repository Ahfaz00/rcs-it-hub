import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Inbox, Mail, Package } from "lucide-react";

import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [products, activeProducts, newEnquiries, newContacts, lowStock, recentEnquiries] =
        await Promise.all([
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "New"),
          supabase
            .from("contact_submissions")
            .select("id", { count: "exact", head: true })
            .eq("status", "New"),
          supabase
            .from("products")
            .select("id, name, slug, stock_quantity, minimum_stock")
            .eq("is_active", true)
            .order("stock_quantity", { ascending: true })
            .limit(5),
          supabase
            .from("enquiries")
            .select("id, name, phone, product_name, status, created_at")
            .order("created_at", { ascending: false })
            .limit(8),
        ]);

      return {
        products: products.count ?? 0,
        activeProducts: activeProducts.count ?? 0,
        newEnquiries: newEnquiries.count ?? 0,
        newContacts: newContacts.count ?? 0,
        lowStock: (lowStock.data ?? []).filter((p) => p.stock_quantity <= (p.minimum_stock ?? 0)),
        recentEnquiries: recentEnquiries.data ?? [],
      };
    },
  });

  const stats = [
    { label: "Products", value: data?.products ?? "-", icon: Package, to: "products" },
    { label: "Active products", value: data?.activeProducts ?? "-", icon: Package, to: "products" },
    { label: "New enquiries", value: data?.newEnquiries ?? "-", icon: Inbox, to: "enquiries" },
    { label: "New messages", value: data?.newContacts ?? "-", icon: Mail, to: "contacts" },
  ];

  return (
    <AdminShell>
      <AdminHeader
        title="Dashboard"
        description="Overview of your catalogue and incoming leads."
        action={
          <Button asChild>
            <Link to="/admin/$resource/$id" params={{ resource: "products", id: "new" }}>
              Add product
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to="/admin/$resource"
            params={{ resource: s.to }}
            className="rounded-lg border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
          >
            <s.icon className="h-4 w-4 text-accent" />
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Recent enquiries</h2>
          {data?.recentEnquiries.length ? (
            <ul className="mt-4 divide-y divide-border">
              {data.recentEnquiries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      to="/admin/$resource/$id"
                      params={{ resource: "enquiries", id: e.id }}
                      className="truncate text-sm font-medium hover:text-accent"
                    >
                      {e.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.phone}
                      {e.product_name ? ` · ${e.product_name}` : ""} · {formatDateTime(e.created_at)}
                    </p>
                  </div>
                  <Badge variant={e.status === "New" ? "default" : "secondary"}>{e.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No enquiries yet.</p>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-warning" /> Low stock
          </h2>
          {data?.lowStock.length ? (
            <ul className="mt-4 divide-y divide-border">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link
                    to="/admin/$resource/$id"
                    params={{ resource: "products", id: p.id }}
                    className="truncate text-sm font-medium hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{p.stock_quantity} in stock</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No products below their alert level.</p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
