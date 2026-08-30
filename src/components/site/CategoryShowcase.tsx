import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { useMotion } from "@/components/site/MotionProvider";
import { cn } from "@/lib/utils";

export type ShowcaseItem = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  image: string;
  count?: number | null;
};

/**
 * Editorial, asymmetric category layout.
 * First item is a dominant full-height feature; the rest form a mixed-size grid.
 */
export function CategoryShowcase({ items }: { items: ShowcaseItem[] }) {
  const motion = useMotion();
  if (items.length === 0) return null;

  const [feature, ...rest] = items;

  return (
    <div className="mt-10 grid gap-3 lg:grid-cols-[1.15fr_1fr]">
      {feature ? (
        <Reveal delay={0} direction="scale" className="h-full">
          <CategoryTile item={feature} size="feature" />
        </Reveal>
      ) : null}

      <div className="grid auto-rows-[11rem] gap-3 sm:grid-cols-2 lg:auto-rows-[13.5rem]">
        {rest.slice(0, 6).map((item, i) => (
          <Reveal
            key={item.id}
            delay={(i + 1) * motion.stagger}
            className={cn("h-full", i === 0 && "sm:col-span-2")}
          >
            <CategoryTile item={item} size={i === 0 ? "wide" : "small"} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function CategoryTile({ item, size }: { item: ShowcaseItem; size: "feature" | "wide" | "small" }) {
  return (
    <Link
      to="/products"
      search={{ category: item.slug }}
      className={cn(
        "group relative block h-full overflow-hidden bg-navy",
        size === "feature" && "min-h-[24rem] lg:min-h-[28rem]",
      )}
    >
      <img
        src={item.image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[1100ms] ease-out will-change-transform group-hover:scale-[1.07] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-transparent transition-opacity duration-500 group-hover:from-navy/95" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white md:p-7">
        <div className="min-w-0">
          <h3
            className={cn(
              "font-display font-bold tracking-tight",
              size === "feature" ? "text-3xl md:text-4xl" : size === "wide" ? "text-2xl" : "text-lg",
            )}
          >
            {item.name}
          </h3>
          {item.description && size !== "small" ? (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">{item.description}</p>
          ) : null}
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center border border-white/25 text-white transition-all duration-300 group-hover:border-cyan group-hover:bg-cyan/15">
          <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
