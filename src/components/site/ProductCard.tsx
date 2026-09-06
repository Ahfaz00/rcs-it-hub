import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Heart, ImageOff, MessageCircle, Scale, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import { mediaUrl } from "@/lib/media";
import { siteQueryOptions, whatsappLink } from "@/lib/site-query";
import { discountPercent, formatINR, formatPrice } from "@/lib/format";
import { useShortlist } from "@/lib/shortlist";
import { cn } from "@/lib/utils";

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

/** Edify-style compact spec chips: CPU · RAM · Storage · OS */
function specChips(p: ProductCardData) {
  return [p.processor_model, p.ram, p.storage_capacity, p.operating_system]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const reduced = useReducedMotion();
  const img = mediaUrl(product.main_image_url);
  const chips = specChips(product);
  const hasPrice = Boolean(product.show_price) && product.price != null;
  const off = hasPrice ? discountPercent(product.price, product.mrp, product.discount) : null;
  const wa = site.settings["whatsapp"];
  const wishlist = useShortlist("wishlist");
  const compare = useShortlist("compare");
  const saved = wishlist.ids.includes(product.id);
  const comparing = compare.ids.includes(product.id);

  return (
    <motion.article
      whileHover={reduced ? {} : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-300 hover:shadow-lift"
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[5/4] overflow-hidden bg-[oklch(0.978_0.005_250)]"
        aria-label={product.name}
      >
        {img ? (
          <img
            src={img}
            alt={product.main_image_alt || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-6"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-7 w-7" />
            <span className="text-xs">Photo coming soon</span>
          </div>
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {off ? (
            <span className="rounded-md bg-success px-2 py-1 text-[0.65rem] font-bold text-success-foreground">
              {off}% OFF
            </span>
          ) : null}
          {product.condition ? (
            <span className="rounded-md bg-navy/90 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-navy-foreground">
              {product.condition}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          onClick={() => {
            const r = wishlist.toggle(product.id);
            if (r?.limitReached) toast.error(`Wishlist is limited to ${wishlist.limit} products.`);
            else toast.success(r?.added ? "Saved to wishlist" : "Removed from wishlist");
          }}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur transition-colors hover:border-primary/40",
            saved ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
        <button
          type="button"
          aria-label={comparing ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
          aria-pressed={comparing}
          onClick={() => {
            const r = compare.toggle(product.id);
            if (r?.limitReached) toast.error(`You can compare up to ${compare.limit} products.`);
            else toast.success(r?.added ? "Added to compare" : "Removed from compare");
          }}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur transition-colors hover:border-primary/40",
            comparing ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Scale className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.brands?.name ? (
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {product.brands.name}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 text-[0.9rem] font-semibold leading-snug tracking-tight sm:text-[0.98rem]">
          <Link to="/products/$slug" params={{ slug: product.slug }} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {chips.length > 0 ? (
          <p className="mt-2 break-words text-[0.78rem] leading-relaxed text-muted-foreground">
            {chips.join(" • ")}
          </p>
        ) : product.short_description ? (
          <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>
        ) : null}


        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[1.05rem] font-bold tracking-tight text-foreground sm:text-[1.15rem]">
              {formatPrice(product.price, product.show_price)}
            </span>
            {hasPrice && product.mrp != null && Number(product.mrp) > Number(product.price) ? (
              <span className="text-[0.82rem] text-muted-foreground line-through">
                {formatINR(Number(product.mrp))}
              </span>
            ) : null}
            {off ? <span className="text-[0.82rem] font-semibold text-success">{off}% off</span> : null}
          </div>

          {product.warranty ? (
            <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span className="line-clamp-1 uppercase tracking-[0.1em]">{product.warranty}</span>
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-2">
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-navy px-2 text-[0.72rem] font-bold text-navy-foreground transition-colors hover:bg-primary active:scale-[0.98] sm:text-[0.75rem]"
            >
              View details
            </Link>
            {wa ? (
              <a
                href={whatsappLink(wa, `Hi, I am interested in ${product.name}. Please share details.`)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Enquire about ${product.name} on WhatsApp`}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-success transition-colors hover:border-success/40 hover:bg-success/10"
              >
                <MessageCircle className="h-4.5 w-4.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
