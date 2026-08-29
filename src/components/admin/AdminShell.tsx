import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Boxes,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  Settings,
  Star,
  Tag,
  Wrench,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

const nav: { to: string; label: string; icon: typeof Package; params?: Record<string, string> }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/$resource", params: { resource: "products" }, label: "Products", icon: Package },
  { to: "/admin/$resource", params: { resource: "categories" }, label: "Categories", icon: Boxes },
  { to: "/admin/$resource", params: { resource: "brands" }, label: "Brands", icon: Tag },
  { to: "/admin/$resource", params: { resource: "services" }, label: "Services", icon: Wrench },
  { to: "/admin/$resource", params: { resource: "enquiries" }, label: "Enquiries", icon: Inbox },
  { to: "/admin/$resource", params: { resource: "contacts" }, label: "Contact messages", icon: Mail },
  { to: "/admin/$resource", params: { resource: "testimonials" }, label: "Testimonials", icon: Star },
  { to: "/admin/$resource", params: { resource: "gallery" }, label: "Gallery", icon: ImageIcon },
  { to: "/admin/$resource", params: { resource: "faqs" }, label: "FAQs", icon: HelpCircle },
  { to: "/admin/$resource", params: { resource: "pages" }, label: "Pages", icon: FileText },
  { to: "/admin/$resource", params: { resource: "seo" }, label: "SEO", icon: Search },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/logs", label: "Activity log", icon: Activity },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const { data: isAdmin, isPending } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return Boolean(data);
    },
    staleTime: 5 * 60 * 1000,
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but does not have admin permissions for this website.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={signOut} variant="outline">
              Sign out
            </Button>
            <Button asChild>
              <Link to="/">Go to website</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside
        className={`${
          open ? "block" : "hidden"
        } w-full shrink-0 border-r border-border bg-card lg:block lg:w-64`}
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto p-4">
          <Link to="/admin" className="px-2 py-1">
            <Logo compact />
          </Link>
          <nav className="mt-6 flex-1 space-y-0.5">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...(item.params ? { params: item.params } : {})}
                activeOptions={{ exact: item.to === "/admin" }}
                activeProps={{ className: "bg-accent/15 text-accent" }}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 space-y-1 border-t border-border pt-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" /> View website
            </Link>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <Logo compact />
          <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
