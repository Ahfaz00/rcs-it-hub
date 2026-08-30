import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { Logo } from "./Logo";
import { siteQueryOptions } from "@/lib/site-query";

const POLICIES = [
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms & Conditions" },
  { slug: "warranty-policy", label: "Warranty Policy" },
  { slug: "shipping-policy", label: "Shipping Policy" },
  { slug: "returns-policy", label: "Return & Replacement" },
];

export function Footer() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const s = site.settings;
  const year = new Date().getFullYear();

  const socials = [
    { url: s["social_facebook"], Icon: Facebook, label: "Facebook" },
    { url: s["social_instagram"], Icon: Instagram, label: "Instagram" },
    { url: s["social_linkedin"], Icon: Linkedin, label: "LinkedIn" },
    { url: s["social_youtube"], Icon: Youtube, label: "YouTube" },
  ].filter((x) => x.url);

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border bg-gradient-navy text-sidebar-foreground">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid-blueprint opacity-[0.08]" />
      <div className="container-page relative grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo inverted />
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70">{s["footer_text"]}</p>
          {s["gst_number"] ? (
            <p className="mt-4 text-xs text-sidebar-foreground/60">GST: {s["gst_number"]}</p>
          ) : null}
          {socials.length > 0 ? (
            <div className="mt-5 flex gap-2">
              {socials.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-xl border border-sidebar-border p-2.5 text-sidebar-foreground/80 transition-all hover:-translate-y-0.5 hover:border-cyan/50 hover:bg-white/10 hover:text-cyan"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
            Products
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {site.categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link
                  to="/products"
                  search={{ category: c.slug }}
                  className="text-sidebar-foreground/70 transition-colors hover:text-cyan"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/about", label: "About Us" },
              { to: "/services", label: "Services" },
              { to: "/bulk-orders", label: "Bulk Orders" },
              { to: "/gallery", label: "Gallery" },
              { to: "/faq", label: "FAQs" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sidebar-foreground/70 transition-colors hover:text-cyan"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-2 text-sm">
            {POLICIES.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/policies/$slug"
                  params={{ slug: p.slug }}
                  className="text-sidebar-foreground/60 transition-colors hover:text-cyan"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-sidebar-foreground/75">
            {s["address"] ? (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                <span>{s["address"]}</span>
              </li>
            ) : null}
            {s["phone"] ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                <span className="flex flex-col">
                  <a href={`tel:${s["phone"].replace(/\s/g, "")}`} className="hover:text-cyan">
                    {s["phone"]}
                  </a>
                  {s["phone_alt"] ? (
                    <a
                      href={`tel:${s["phone_alt"].replace(/\s/g, "")}`}
                      className="hover:text-cyan"
                    >
                      {s["phone_alt"]}
                    </a>
                  ) : null}
                </span>
              </li>
            ) : null}
            {s["email"] ? (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                <a href={`mailto:${s["email"]}`} className="break-all hover:text-cyan">
                  {s["email"]}
                </a>
              </li>
            ) : null}
            {s["business_hours"] ? <li className="pt-1 text-xs">{s["business_hours"]}</li> : null}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-sidebar-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-sidebar-foreground/60 sm:flex-row">
          <p>
            &copy; {year} {s["copyright_text"]}
          </p>
          <p>Refurbished IT hardware wholesaler &middot; Navi Mumbai, India</p>
        </div>
      </div>
    </footer>
  );
}
