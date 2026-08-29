import { useCallback, useEffect, useRef, useState } from "react";

import { useMotion } from "@/components/site/MotionProvider";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  src: string;
  alt: string;
  caption: string;
};

export function HeroSlider({
  slides,
  interval = 5200,
  className,
}: {
  slides: HeroSlide[];
  interval?: number;
  className?: string;
}) {
  const motion = useMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, interval, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={cn("group relative overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== index}
          style={{ transitionDuration: `${Math.max(motion.duration, 150)}ms` }}
          className={cn(
            "absolute inset-0 transition-opacity ease-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "sync" : "async"}
            className={cn("h-full w-full object-cover", i === index && motion.kenburns && "animate-kenburns")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent" />
        </div>
      ))}

      {/* caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
        <p
          key={index}
          className={cn(
            "font-display text-sm font-semibold text-primary-foreground drop-shadow md:text-base",
            motion.enabled && "animate-fade-in",
          )}
        >
          {slides[index]?.caption}
        </p>
      </div>

      {/* dots */}
      <div className="absolute bottom-4 right-5 flex gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === index ? "w-7 bg-accent" : "w-3 bg-primary-foreground/50 hover:bg-primary-foreground/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}
