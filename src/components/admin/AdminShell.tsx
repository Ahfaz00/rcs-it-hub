import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Boxes,
  FileText,
  GalleryHorizontal,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Package,
  PackageSearch,
  Search,
  Send,
  Settings,
  Shuffle,
  SlidersHorizontal,
  Star,
  Tag,
  Tags,
  Target,
  Wrench,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { to: string; label: string; icon: typeof Package; params?: Record<string, string> };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catalog",
    items: [
      { to: "/admin/$resource", params: { resource: "products" }, label: "Products", icon: Package },
      { to: "/admin/$resource", params: { resource: "categories" }, label: "Categories", icon: Boxes },
      { to: "/admin/$resource", params: { resource: "brands" }, label: "Brands", icon: Tag },
      { to: "/admin/$resource", params: { resource: "collections" }, label: "Collections", icon: Layers },
      { to: "/admin/$resource", params: { resource: "usage_tags" }, label: "Shop by usage", icon: Target },
      { to: "/admin/$resource", params: { resource: "attributes" }, label: "Attributes", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Leads",
    items: [
      { to: "/admin/$resource", params: { resource: "enquiries" }, label: "Enquiries", icon: Inbox },
      { to: "/admin/$resource", params: { resource: "contacts" }, label: "Contact messages", icon: Mail },
      { to: "/admin/$resource", params: { resource: "product_requests" }, label: "Product requests", icon: PackageSearch },
      { to: "/admin/$resource", params: { resource: "newsletter" }, label: "Newsletter", icon: Send },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/admin/$resource", params: { resource: "banners" }, label: "Banners", icon: GalleryHorizontal },
      { to: "/admin/$resource", params: { resource: "blog" }, label: "Blog posts", icon: Newspaper },
      { to: "/admin/$resource", params: { resource: "blog_categories" }, label: "Blog categories", icon: Tags },
      { to: "/admin/$resource", params: { resource: "services" }, label: "Services", icon: Wrench },
      { to: "/admin/$resource", params: { resource: "testimonials" }, label: "Testimonials", icon: Star },
      { to: "/admin/$resource", params: { resource: "gallery" }, label: "Gallery", icon: ImageIcon },
      { to: "/admin/$resource", params: { resource: "faqs" }, label: "FAQs", icon: HelpCircle },
      { to: "/admin/$resource", params: { resource: "pages" }, label: "Pages", icon: FileText },
      { to: "/admin/$resource", params: { resource: "navigation" }, label: "Navigation", icon: Menu },
    ],
  },
  {
    title: "SEO",
    items: [
      { to: "/admin/$resource", params: { resource: "seo" }, label: "Metadata", icon: Search },
      { to: "/admin/$resource", params: { resource: "redirects" }, label: "Redirects", icon: Shuffle },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
      { to: "/admin/logs", label: "Activity log", icon: Activity },
    ],
  },
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
        } w-full shrink-0 border-r border-sidebar-border bg-gradient-navy text-sidebar-foreground lg:block lg:w-64`}
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto p-4">
          <div className="px-2 py-1">
            <Logo compact inverted />
          </div>
          <nav className="mt-6 flex-1 space-y-4">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="px-3 pb-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/40">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      {...(item.params ? { params: item.params } : {})}
                      activeOptions={{ exact: item.to === "/admin" }}
                      activeProps={{ className: "bg-white/10 text-cyan shadow-card" }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-4 space-y-1 border-t border-sidebar-border pt-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
            >
              <LayoutDashboard className="h-4 w-4" /> View website
            </Link>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
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
    <div className="mb-7 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
