import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { Icon } from "@/components/site/Icon";
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

/** Premium category showcase: image tiles with hover zoom, sliding overlay and scroll reveal. */
export function CategoryShowcase({ items }: { items: ShowcaseItem[] }) {
  const motion = useMotion();
  if (items.length === 0) return null;

  return (
    <div className="mt-8 grid auto-rows-[13rem] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[15rem]">
      {items.map((item, i) => {
        const feature = i === 0;
        return (
          <Reveal
            key={item.id}
            delay={i * motion.stagger}
            direction={feature ? "scale" : "up"}
            className={cn("h-full", feature && "sm:col-span-2 sm:row-span-2")}
          >
            <Link
              to="/products"
              search={{ category: item.slug }}
              className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-500 hover:shadow-lift"
            >
              <img
                src={item.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out will-change-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/55 to-navy/10 transition-opacity duration-500 group-hover:via-navy/65" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-brand text-primary-foreground shadow-glow backdrop-blur transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
                  <Icon name={item.icon ?? null} className="h-4.5 w-4.5" />
                </span>
                <h3
                  className={cn(
                    "mt-3 font-display font-semibold transition-colors duration-300 group-hover:text-cyan",
                    feature ? "text-xl md:text-2xl" : "text-base",
                  )}
                >
                  {item.name}
                </h3>
                {item.description ? (
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-white/80 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:opacity-100 sm:translate-y-2">
                    {item.description}
                  </p>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan">
                  Browse stock
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 transition-colors duration-500 group-hover:ring-cyan/60" />
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
