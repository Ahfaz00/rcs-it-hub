import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Vengeance-style spotlight navbar: a soft light follows the cursor across
 * the nav row while each link keeps its own underline behaviour.
 */
export function SpotlightNav({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      style={{
        ["--vg-x" as string]: `${pos.x}%`,
        ["--vg-y" as string]: `${pos.y}%`,
      }}
      className={cn("vg-spotlight-nav relative", active && "is-active", className)}
    >
      <span aria-hidden="true" className="vg-spotlight-nav-glow" />
      {children}
    </div>
  );
}
