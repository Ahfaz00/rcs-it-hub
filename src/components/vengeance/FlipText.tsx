import { useEffect, useRef, useState, type ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * Vengeance-style kinetic heading: characters flip up into place when the
 * heading scrolls into view. Falls back to plain text without JS/motion.
 */
export function FlipText({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    const failsafe = window.setTimeout(() => setShown(true), 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  const words = text.split(" ");
  let index = 0;

  return (
    <Tag ref={ref} className={cn("vg-flip", className)} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap">
          {[...word].map((char, ci) => {
            const i = index++;
            return (
              <span
                key={`${char}-${ci}`}
                aria-hidden="true"
                className={cn("vg-flip-char", shown && "is-in")}
                style={{ animationDelay: `${delay + i * 0.022}s` }}
              >
                {char}
              </span>
            );
          })}
          {wi < words.length - 1 ? <span aria-hidden="true">&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}

/** Hover morph label: swaps between two stacked layers on hover. */
export function MorphText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("vg-morph group/morph", className)}>
      <span className="vg-morph-a">{text}</span>
      <span aria-hidden="true" className="vg-morph-b">
        {text}
      </span>
    </span>
  );
}
