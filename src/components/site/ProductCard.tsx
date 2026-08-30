import { Link } from "@tanstack/react-router";
import { ImageOff, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/lib/media";
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
  const img = mediaUrl(product.main_image_url);
  const chips = configChips(product, 4);
  const hasPrice = Boolean(product.show_price) && product.price != null;
  const off = hasPrice ? discountPercent(product.price, product.mrp, product.discount) : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-4/3 overflow-hidden bg-surface"
      >
        {img ? (
          <img
            src={img}
            alt={product.main_image_alt || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-7 w-7" />
            <span className="text-xs">Photo coming soon</span>
          </div>
        )}
        {product.condition ? (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">{product.condition}</Badge>
        ) : null}
        {off ? (
          <span className="absolute right-3 top-3 rounded-full bg-success px-2 py-0.5 text-[0.7rem] font-semibold text-success-foreground">
            {off}% off
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.brands?.name ? (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brands.name}
          </p>
        ) : null}
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug">
          <Link to="/products/$slug" params={{ slug: product.slug }} className="hover:text-accent">
            {product.name}
          </Link>
        </h3>

        {chips.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li
                key={c}
                className="rounded-md bg-muted px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
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
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-lg font-bold">
              {formatPrice(product.price, product.show_price)}
            </span>
            {hasPrice && product.mrp != null && Number(product.mrp) > Number(product.price) ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatINR(Number(product.mrp))}
              </span>
            ) : null}
          </div>
          <Button asChild size="sm" variant="outline" className="mt-3 w-full">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              View details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
