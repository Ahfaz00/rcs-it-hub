import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ImageOff, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
      whileHover={reduced ? {} : { y: -5 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="group relative flex h-full flex-col bg-card transition-shadow duration-300 hover:shadow-lift"
    >
      {/* Image is the hero of the card */}
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-[oklch(0.975_0.006_250)]"
        aria-label={product.name}
      >
        {img ? (
          <img
            src={img}
            alt={product.main_image_alt || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-7"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-sm">Photo coming soon</span>
          </div>
        )}

        {product.condition || off ? (
          <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
            {product.condition ? (
              <span className="bg-navy/90 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-navy-foreground">
                {product.condition}
              </span>
            ) : null}
            {off ? (
              <span className="bg-success px-3 py-1.5 text-[0.68rem] font-bold text-success-foreground">
                {off}% OFF
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-6">
        {product.brands?.name ? (
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-primary">
            {product.brands.name}
          </p>
        ) : null}

        <h3 className="mt-2.5 line-clamp-2 font-display text-[1.2rem] font-semibold leading-snug tracking-tight sm:text-[1.3rem]">
          <Link to="/products/$slug" params={{ slug: product.slug }} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {chips.length > 0 ? (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
            {chips.slice(0, 3).join(" · ")}
          </p>
        ) : product.short_description ? (
          <p className="mt-3 line-clamp-2 text-[0.95rem] leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>
        ) : null}

        {product.warranty ? (
          <p className="mt-2 text-[0.9rem] text-muted-foreground/85">{product.warranty}</p>
        ) : null}

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-display text-[1.45rem] font-bold tracking-tight text-foreground">
              {formatPrice(product.price, product.show_price)}
            </span>
            {hasPrice && product.mrp != null && Number(product.mrp) > Number(product.price) ? (
              <span className="text-base text-muted-foreground line-through">{formatINR(Number(product.mrp))}</span>
            ) : null}
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-navy px-5 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-navy-foreground transition-colors hover:bg-primary active:scale-[0.98]"
            >
              View details
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            {wa ? (
              <a
                href={whatsappLink(wa, `Hi, I am interested in ${product.name}. Please share details.`)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Enquire about ${product.name} on WhatsApp`}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-border text-success transition-colors hover:border-success/40 hover:bg-success/10"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

