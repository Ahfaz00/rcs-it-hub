import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Vengeance-style card shell: a cursor-tracked spotlight and a lift on hover.
 * Wraps existing cards without changing their internals.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        });
      }}
      style={{
        ["--vg-x" as string]: `${pos.x}%`,
        ["--vg-y" as string]: `${pos.y}%`,
      }}
      className={cn("vg-spotlight-card group/spot relative h-full rounded-2xl", className)}
    >
      <span aria-hidden="true" className="vg-spotlight-card-glow" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
