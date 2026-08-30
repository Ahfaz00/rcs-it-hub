import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, Phone, Search, MessageCircle, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { motion } from "motion/react";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <div
        className={cn(
          "bg-gradient-navy text-sidebar-foreground transition-all duration-500",
          scrolled ? "max-h-0 overflow-hidden opacity-0" : "max-h-12 opacity-100",
        )}
      >
        <div className="container-page flex h-9 items-center gap-6 overflow-hidden text-[0.72rem]">
          {announcement ? <p className="truncate font-medium">{announcement}</p> : null}
          <div className="hidden flex-1 items-center justify-center gap-8 xl:flex">
            {TRUST.map(({ Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 whitespace-nowrap text-sidebar-foreground/80">
                <Icon className="h-3.5 w-3.5 text-cyan" />
                {text}
              </span>
            ))}
          </div>
          <div className="ml-auto hidden items-center gap-4 whitespace-nowrap sm:flex">
            {s["phone"] ? (
              <a href={`tel:${s["phone"].replace(/\s/g, "")}`} className="hover:text-cyan">
                {s["phone"]}
              </a>
            ) : null}
            {s["email"] ? (
              <a href={`mailto:${s["email"]}`} className="hover:text-cyan">
                {s["email"]}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b bg-background/85 backdrop-blur-xl transition-all duration-300",
          scrolled ? "border-border shadow-card" : "border-border/60",
        )}
      >
        <div
          className={cn(
            "container-page flex items-center gap-4 transition-all duration-300",
            scrolled ? "h-[3.75rem]" : "h-[4.5rem]",
          )}
        >
          <Logo />

          <nav className="ml-6 hidden shrink-0 items-center gap-0.5 whitespace-nowrap xl:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="group relative rounded-full px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
                <span className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-brand transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <form onSubmit={search} className="ml-auto hidden min-w-0 flex-1 max-w-[15rem] items-center xl:flex">
            <div className="relative w-full min-w-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="h-11 rounded-full border-border bg-muted/60 pl-11 text-sm transition-shadow focus-visible:bg-card focus-visible:shadow-card"
              />
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-3">

            {s["whatsapp"] ? (
              <Button asChild size="sm" variant="outline" className="hidden h-11 rounded-full px-4 sm:inline-flex">
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
                className="hidden h-11 rounded-full bg-gradient-brand px-5 text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] sm:inline-flex"
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
                <div className="flex items-center border-b border-border bg-gradient-soft p-4 pr-14">
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
                  {NAV.map((item, i) => (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
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
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                {s["phone"] ? (
                  <div className="border-t border-border p-4">
                    <Button asChild className="h-11 w-full rounded-full bg-gradient-brand text-primary-foreground">
                      <a href={`tel:${s["phone"].replace(/\s/g, "")}`}>
                        <Phone className="mr-1.5 h-4 w-4" /> Call {s["phone"]}
                      </a>
                    </Button>
                  </div>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category rail */}
      <div
        className={cn(
          "hidden border-b border-border bg-background/90 backdrop-blur transition-all duration-500 lg:block",
          scrolled ? "max-h-0 overflow-hidden border-transparent opacity-0" : "max-h-16 opacity-100",
        )}
      >
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
                "transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
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
