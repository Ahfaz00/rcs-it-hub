import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Menu, Phone, Search, MessageCircle, X } from "lucide-react";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteQueryOptions, whatsappLink, enquiryMessage } from "@/lib/site-query";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Services", to: "/services" },
  { label: "Bulk Orders", to: "/bulk-orders" },
  { label: "Gallery", to: "/gallery" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function Header() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const s = site.settings;
  const announcement = s["announcement_enabled"] === "true" ? s["announcement_text"] : "";

  function search(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/products", search: { search: term || undefined } });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {announcement ? (
        <div className="bg-primary text-primary-foreground">
          <div className="container-page flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs">
            <p className="font-medium">{announcement}</p>
            <div className="hidden items-center gap-4 sm:flex">
              {s["phone"] ? (
                <a href={`tel:${s["phone"].replace(/\s/g, "")}`} className="hover:underline">
                  {s["phone"]}
                </a>
              ) : null}
              {s["email"] ? (
                <a href={`mailto:${s["email"]}`} className="hover:underline">
                  {s["email"]}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container-page flex h-16 items-center gap-4">
          <Logo />

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={search} className="ml-auto hidden max-w-xs flex-1 items-center lg:ml-4 lg:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="pl-9"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {s["whatsapp"] ? (
              <Button asChild size="sm" className="hidden bg-success text-success-foreground hover:bg-success/90 sm:inline-flex">
                <a
                  href={whatsappLink(s["whatsapp"], enquiryMessage(s["default_enquiry_message"]))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                </a>
              </Button>
            ) : null}
            {s["phone"] ? (
              <Button asChild size="sm" variant="default" className="hidden sm:inline-flex">
                <a href={`tel:${s["phone"].replace(/\s/g, "")}`}>
                  <Phone className="mr-1.5 h-4 w-4" /> Call
                </a>
              </Button>
            ) : null}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center justify-between border-b border-border p-4">
                  <Logo compact />
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <form onSubmit={search} className="border-b border-border p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      placeholder="Search products"
                      aria-label="Search products"
                      className="pl-9"
                    />
                  </div>
                </form>
                <nav className="flex flex-col p-2">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-border p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categories
                  </p>
                  <div className="flex flex-col">
                    {site.categories.map((c) => (
                      <Link
                        key={c.id}
                        to="/products"
                        search={{ category: c.slug }}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-border bg-surface lg:block">
        <div className="container-page flex items-center gap-1 overflow-x-auto py-1.5">
          {site.categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground",
                "transition-colors hover:bg-background hover:text-foreground",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
