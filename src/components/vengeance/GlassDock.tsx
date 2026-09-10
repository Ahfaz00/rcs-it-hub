import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUp, Boxes, Home, Layers, Phone } from "lucide-react";

import { siteQueryOptions } from "@/lib/site-query";
import { cn } from "@/lib/utils";

/**
 * Vengeance-style glass dock: a floating, magnifying quick-nav bar that
 * appears once the visitor scrolls past the hero.
 */
export function GlassDock() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const [visible, setVisible] = useState(false);
  const phone = site.settings["phone"];

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { label: "Home", to: "/", Icon: Home },
    { label: "Products", to: "/products", Icon: Layers },
    { label: "Bulk orders", to: "/bulk-orders", Icon: Boxes },
  ];

  return (
    <div
      className={cn(
        "vg-dock pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-all duration-500 sm:bottom-6",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      )}
    >
      <nav
        aria-label="Quick navigation"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1.5 shadow-lift backdrop-blur-xl"
      >
        {items.map(({ label, to, Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="vg-dock-item group/dock relative flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
          >
            <Icon className="h-5 w-5 transition-transform duration-300 group-hover/dock:-translate-y-0.5 group-hover/dock:scale-110" />
            <span className="vg-dock-tip">{label}</span>
          </Link>
        ))}
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            aria-label={`Call ${phone}`}
            className="vg-dock-item group/dock relative flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
          >
            <Phone className="h-5 w-5 transition-transform duration-300 group-hover/dock:-translate-y-0.5 group-hover/dock:scale-110" />
            <span className="vg-dock-tip">Call now</span>
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="vg-dock-item group/dock relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 hover:scale-105"
        >
          <ArrowUp className="h-5 w-5" />
          <span className="vg-dock-tip">Top</span>
        </button>
      </nav>
    </div>
  );
}
