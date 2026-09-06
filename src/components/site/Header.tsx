import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Heart, Menu, Phone, Scale, MessageCircle, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { motion } from "motion/react";

import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteQueryOptions, whatsappLink, enquiryMessage } from "@/lib/site-query";
import { useShortlist } from "@/lib/shortlist";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Collections", to: "/collections" },
  { label: "Services", to: "/services" },
  { label: "Bulk Orders", to: "/bulk-orders" },
  { label: "Blog", to: "/blog" },
  { label: "Gallery", to: "/gallery" },
  { label: "Videos", to: "/videos" },
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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wishlist = useShortlist("wishlist");
  const compare = useShortlist("compare");

  useEffect(() => {
    // Use separate enter/exit thresholds so collapsing the announcement strip
    // cannot move the page back across the same threshold and make it flicker.
    const onScroll = () => {
      setScrolled((current) => {
        if (!current && window.scrollY > 80) return true;
        if (current && window.scrollY < 8) return false;
        return current;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const s = site.settings;
  const announcement = s["announcement_enabled"] === "true" ? s["announcement_text"] : "";

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Trust / announcement strip */}
      <div
        className={cn(
          "bg-gradient-navy text-sidebar-foreground",
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
          "border-b transition-all duration-300",
          scrolled
            ? "border-border bg-background/80 shadow-card backdrop-blur-xl"
            : "border-border/50 bg-background",
        )}
      >
        <div
          className="container-page flex h-[4.25rem] min-w-0 items-center gap-3 md:gap-4"
        >
          <Logo />

          <div className="ml-auto hidden min-w-0 max-w-xl flex-1 items-center lg:flex">
            <SearchBox
              placeholder="Search laptops, desktops, monitors…"
              inputClassName="h-11 rounded-full border border-border bg-surface shadow-none focus-visible:border-primary focus-visible:ring-0"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-3 lg:gap-2">

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-11 w-11 items-center justify-center text-foreground/70 transition-colors hover:text-primary sm:inline-flex"
            >
              <Heart className="h-5 w-5" />
              {wishlist.ids.length ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
                  {wishlist.ids.length}
                </span>
              ) : null}
            </Link>
            <Link
              to="/compare"
              aria-label="Compare products"
              className="relative hidden h-11 w-11 items-center justify-center text-foreground/70 transition-colors hover:text-primary sm:inline-flex"
            >
              <Scale className="h-5 w-5" />
              {compare.ids.length ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
                  {compare.ids.length}
                </span>
              ) : null}
            </Link>
            {/* Mobile quick actions */}
            {s["whatsapp"] ? (
              <a
                href={whatsappLink(s["whatsapp"], enquiryMessage(s["default_enquiry_message"]))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="inline-flex h-11 w-11 items-center justify-center text-success transition-colors hover:bg-success/10 active:scale-95 sm:hidden"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            ) : null}
            {s["phone"] ? (
              <a
                href={`tel:${s["phone"].replace(/\s/g, "")}`}
                aria-label={`Call ${s["phone"]}`}
                className="inline-flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-muted active:scale-95 sm:hidden"
              >
                <Phone className="h-5 w-5" />
              </a>
            ) : null}

            {s["whatsapp"] ? (
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="hidden h-11 rounded-full px-4 text-[0.75rem] font-bold uppercase tracking-[0.12em] hover:bg-success/10 hover:text-success md:inline-flex"
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
                className="hidden h-11 rounded-full bg-navy px-5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-navy-foreground transition-colors hover:bg-primary sm:inline-flex"
              >
                <a href={`tel:${s["phone"].replace(/\s/g, "")}`}>
                  <Phone className="mr-1.5 h-4 w-4" /> Call now
                </a>
              </Button>
            ) : null}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center border-b border-border bg-gradient-soft p-4 pr-14">
                  <Logo compact />
                </div>

                <div className="border-b border-border p-4">
                  <SearchBox
                    placeholder="Search products"
                    inputClassName="rounded-full"
                    onNavigate={() => setOpen(false)}
                  />
                </div>
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
                        className="block px-4 py-4 font-display text-lg font-semibold tracking-tight text-foreground transition-colors hover:bg-muted hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
                  <Link
                    to="/wishlist"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-border px-4 py-3 text-sm font-semibold"
                  >
                    Wishlist ({wishlist.ids.length})
                  </Link>
                  <Link
                    to="/compare"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-border px-4 py-3 text-sm font-semibold"
                  >
                    Compare ({compare.ids.length})
                  </Link>
                </div>
                <div className="border-t border-border p-4">
                  <p className="mb-3 text-eyebrow text-muted-foreground">Categories</p>
                  <div className="flex flex-col">
                    {site.categories.map((c) => (
                      <Link
                        key={c.id}
                        to="/products"
                        search={{ category: c.slug }}
                        onClick={() => setOpen(false)}
                        className="px-4 py-3 text-[0.95rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                {s["phone"] ? (
                  <div className="border-t border-border p-4">
                    <Button
                      asChild
                      className="h-14 w-full rounded-full bg-navy text-[0.8rem] font-bold uppercase tracking-[0.14em] text-navy-foreground hover:bg-primary"
                    >
                      <a href={`tel:${s["phone"].replace(/\s/g, "")}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call {s["phone"]}
                      </a>
                    </Button>
                  </div>
                ) : null}

              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-b border-border bg-background px-4 py-2 lg:hidden">
        <SearchBox placeholder="Search laptops, desktops…" inputClassName="h-11 rounded-full bg-surface" />
      </div>

      {/* Primary nav row (desktop) */}
      <div className="hidden border-b border-border bg-background lg:block">
        <nav className="container-page flex items-center justify-center gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group relative shrink-0 whitespace-nowrap px-3 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
              <span className="pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Category rail */}
      <div
        className="hidden border-b border-border bg-surface/70 backdrop-blur lg:block"
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
                "whitespace-nowrap rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground/80",
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
