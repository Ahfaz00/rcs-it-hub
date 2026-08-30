import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ImageOff, MessageCircle, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/lib/media";
import { siteQueryOptions, whatsappLink } from "@/lib/site-query";
import { configChips, discountPercent, formatINR, formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  condition?: string | null;
  price?: number | null;
  mrp?: number | null;
  discount?: number | null;
  show_price?: boolean | null;
  main_image_url?: string | null;
  main_image_alt?: string | null;
  availability?: string | null;
  warranty?: string | null;
  processor_model?: string | null;
  ram?: string | null;
  storage_capacity?: string | null;
  operating_system?: string | null;
  display_size?: string | null;
  brands?: { name: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const reduced = useReducedMotion();
  const img = mediaUrl(product.main_image_url);
  const chips = configChips(product, 4);
  const hasPrice = Boolean(product.show_price) && product.price != null;
  const off = hasPrice ? discountPercent(product.price, product.mrp, product.discount) : null;
  const wa = site.settings["whatsapp"];

  return (
    <motion.article
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-[box-shadow,border-color] duration-300 hover:border-primary/35 hover:shadow-lift"
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-4/3 overflow-hidden bg-gradient-soft"
        aria-label={product.name}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 grid-blueprint opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />
        {img ? (
          <img
            src={img}
            alt={product.main_image_alt || product.name}
            loading="lazy"
            decoding="async"
            className="relative h-full w-full object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.07] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-7 w-7" />
            <span className="text-xs">Photo coming soon</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.condition ? (
            <Badge className="bg-navy/90 text-navy-foreground backdrop-blur">{product.condition}</Badge>
          ) : null}
          {off ? (
            <span className="w-fit rounded-full bg-success px-2 py-0.5 text-[0.7rem] font-semibold text-success-foreground">
              {off}% off
            </span>
          ) : null}
        </div>
        {product.availability ? (
          <span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-0.5 text-[0.68rem] font-medium text-muted-foreground backdrop-blur">
            {product.availability}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {product.brands?.name ? (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
            {product.brands.name}
          </p>
        ) : null}
        <h3 className="mt-1.5 line-clamp-2 font-display text-base font-semibold leading-snug">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>

        {chips.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li
                key={c}
                className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[0.68rem] text-muted-foreground"
              >
                {c}
              </li>
            ))}
          </ul>
        ) : product.short_description ? (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        ) : null}

        {product.warranty ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> {product.warranty}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-2 border-t border-border pt-4">
            <span className="font-display text-lg font-bold text-foreground">
              {formatPrice(product.price, product.show_price)}
            </span>
            {hasPrice && product.mrp != null && Number(product.mrp) > Number(product.price) ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatINR(Number(product.mrp))}
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <Button asChild size="sm" className="h-10 rounded-full">
              <Link to="/products/$slug" params={{ slug: product.slug }}>
                View details
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            {wa ? (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-10 w-10 rounded-full p-0 text-success hover:bg-success/10 hover:text-success"
              >
                <a
                  href={whatsappLink(wa, `Hi, I am interested in ${product.name}. Please share details.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Enquire about ${product.name} on WhatsApp`}
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
