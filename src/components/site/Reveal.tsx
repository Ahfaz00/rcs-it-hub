import { useEffect, useRef, useState, type ReactNode } from "react";

import { useMotion } from "@/components/site/MotionProvider";
import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right" | "scale";

const hidden: Record<Direction, string> = {
  up: "translate-y-8",
  left: "-translate-x-8",
  right: "translate-x-8",
  scale: "scale-95",
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const motion = useMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!motion.enabled) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [motion.enabled]);

  if (!motion.enabled) {
    return (
      <Tag ref={ref as never} className={className}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms`, transitionDuration: `${motion.duration}ms` }}
      className={cn(
        "transition-all ease-out motion-reduce:transition-none",
        shown ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-0" : cn("opacity-0 blur-[2px]", hidden[direction]),
        className,
      )}
    >
      {children}
    </Tag>
  );
}
