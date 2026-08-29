import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  condition?: string | null;
  price?: number | null;
  show_price?: boolean | null;
  main_image_url?: string | null;
  main_image_alt?: string | null;
  availability?: string | null;
  warranty?: string | null;
  brands?: { name: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = mediaUrl(product.main_image_url);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow hover:shadow-lift">
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
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
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
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.brands?.name ? (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brands.name}
          </p>
        ) : null}
        <h3 className="mt-1 font-display text-base font-semibold leading-snug">
          <Link to="/products/$slug" params={{ slug: product.slug }} className="hover:text-accent">
            {product.name}
          </Link>
        </h3>
        {product.short_description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5 text-[0.7rem] text-muted-foreground">
          {product.warranty ? (
            <span className="rounded border border-border px-1.5 py-0.5">{product.warranty}</span>
          ) : null}
          {product.availability ? (
            <span className="rounded border border-border px-1.5 py-0.5">{product.availability}</span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-display text-sm font-semibold">
            {formatPrice(product.price, product.show_price)}
          </span>
          <Button asChild size="sm" variant="outline">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              View details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
