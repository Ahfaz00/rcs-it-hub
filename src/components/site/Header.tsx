import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, Phone, Search, MessageCircle, ShieldCheck, RotateCcw, Truck } from "lucide-react";

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

const TRUST = [
  { Icon: ShieldCheck, text: "Quality tested refurbished hardware" },
  { Icon: RotateCcw, text: "Warranty as per product listing" },
  { Icon: Truck, text: "Pan-India dispatch from Navi Mumbai" },
];

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
      {/* Trust / announcement strip */}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="container-page flex h-9 items-center gap-6 overflow-hidden text-[0.72rem]">
          {announcement ? (
            <p className="truncate font-medium">{announcement}</p>
          ) : null}
          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {TRUST.map(({ Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 whitespace-nowrap text-sidebar-foreground/80">
                <Icon className="h-3.5 w-3.5 text-sidebar-primary" />
                {text}
              </span>
            ))}
          </div>
          <div className="ml-auto hidden items-center gap-4 sm:flex">
            {s["phone"] ? (
              <a href={`tel:${s["phone"].replace(/\s/g, "")}`} className="hover:text-sidebar-primary">
                {s["phone"]}
              </a>
            ) : null}
            {s["email"] ? (
              <a href={`mailto:${s["email"]}`} className="hover:text-sidebar-primary">
                {s["email"]}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="container-page flex h-[4.5rem] items-center gap-4">
          <Logo />

          <nav className="ml-6 hidden items-center gap-0.5 xl:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={search} className="ml-auto hidden max-w-md flex-1 items-center lg:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="h-11 rounded-full border-border bg-muted/60 pl-11 text-sm"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            {s["whatsapp"] ? (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hidden h-11 rounded-full px-4 sm:inline-flex"
              >
                <a
                  href={whatsappLink(s["whatsapp"], enquiryMessage(s["default_enquiry_message"]))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-1.5 h-4 w-4 text-success" /> WhatsApp
                </a>
              </Button>
            ) : null}
            {s["phone"] ? (
              <Button
                asChild
                size="sm"
                className="hidden h-11 rounded-full bg-sidebar px-5 text-sidebar-foreground hover:bg-sidebar/90 sm:inline-flex"
              >
                <a href={`tel:${s["phone"].replace(/\s/g, "")}`}>
                  <Phone className="mr-1.5 h-4 w-4" /> Call now
                </a>
              </Button>
            ) : null}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full xl:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center border-b border-border p-4 pr-14">
                  <Logo compact />
                </div>

                <form onSubmit={search} className="border-b border-border p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      placeholder="Search products"
                      aria-label="Search products"
                      className="rounded-full pl-9"
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

      {/* Category rail */}
      <div className="hidden border-b border-border bg-background lg:block">
        <div className="container-page flex items-center gap-2 overflow-x-auto py-2">
          <span className="mr-1 flex items-center gap-1 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Shop <ChevronDown className="h-3 w-3" />
          </span>
          {site.categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className={cn(
                "whitespace-nowrap rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground",
                "transition-colors hover:border-accent hover:bg-accent/10 hover:text-foreground",
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
