import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, Cpu, Laptop, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

type PromoSlide = {
  id: string;
  eyebrow: string;
  title: string;
  offer: string;
  detail: string;
  cta: string;
  to: string;
  search?: Record<string, string>;
  Icon: typeof Cpu;
};

const SLIDES: PromoSlide[] = [
  {
    id: "processors",
    eyebrow: "Bulk lot • Min 100 pcs",
    title: "Intel Processor Stock",
    offer: "i3 7th Gen @ ₹375*",
    detail: "i3 / i5 / i7 — 2nd to 11th Gen. Below market rates, negotiable for one-shot buyers.",
    cta: "View processors",
    to: "/products",
    search: { category: "processors" },
    Icon: Cpu,
  },
  {
    id: "laptops",
    eyebrow: "Quality tested • 6 month warranty",
    title: "Refurbished Laptops",
    offer: "Below market price",
    detail: "Dell, HP, Lenovo business laptops — graded, tested and ready to perform.",
    cta: "Shop laptops",
    to: "/products",
    search: { category: "laptops" },
    Icon: Laptop,
  },
  {
    id: "bulk",
    eyebrow: "B2B • Pan-India dispatch",
    title: "Bulk Orders & AMC",
    offer: "Best wholesale rates",
    detail: "Office setups, workstations, AMC and rental — one call, full IT solution.",
    cta: "Get a quote",
    to: "/bulk-orders",
    Icon: Truck,
  },
];

export function PromoBannerSlider({ interval = 4500 }: { interval?: number }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length),
    [],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [interval]);

  const slide = SLIDES[index]!;

  return (
    <section
      aria-label="Current offers"
      className="relative overflow-hidden border-b border-white/10 bg-ink-ambient text-white"
    >
      <div aria-hidden="true" className="absolute inset-0 grid-blueprint opacity-[0.07]" />
      <div className="container-page relative flex min-h-[7.5rem] items-center gap-4 py-4 sm:gap-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan/15 text-cyan sm:h-14 sm:w-14">
          <slide.Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>

        <div key={slide.id} className="min-w-0 flex-1 animate-fade-in">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cyan sm:text-[0.65rem]">
            {slide.eyebrow}
          </p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <p className="font-display text-lg font-extrabold uppercase tracking-tight sm:text-2xl">
              {slide.title}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-cyan-foreground sm:text-xs">
              <BadgePercent className="h-3 w-3" />
              {slide.offer}
            </span>
          </div>
          <p className="mt-1 truncate text-[0.72rem] text-white/60 sm:text-sm">{slide.detail}</p>
        </div>

        <Link
          to={slide.to}
          search={slide.search}
          className="group hidden shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-cyan hover:text-cyan-foreground sm:inline-flex"
        >
          {slide.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className="absolute bottom-2 right-4 flex gap-1.5 sm:right-6">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show offer: ${s.title}`}
              aria-current={i === index}
              className={cn(
                "h-1 transition-all duration-300",
                i === index ? "w-6 bg-cyan" : "w-2.5 bg-white/30 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
