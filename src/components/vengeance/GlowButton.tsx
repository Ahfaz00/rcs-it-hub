import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Vengeance-style hover button: cursor-tracked glow, magnetic pull and press feel.
 * Renders a plain anchor so it works with internal paths and external links alike.
 */
export function GlowButton({
  href,
  children,
  tone = "brand",
  className,
  target,
  rel,
}: {
  href: string;
  children: ReactNode;
  tone?: "brand" | "outline" | "dark";
  className?: string;
  target?: string;
  rel?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [shift, setShift] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = e.clientX - r.left;
    const ry = e.clientY - r.top;
    setPos({ x: (rx / r.width) * 100, y: (ry / r.height) * 100 });
    setShift({ x: (rx / r.width - 0.5) * 10, y: (ry / r.height - 0.5) * 6 });
  };

  const reset = () => setShift({ x: 0, y: 0 });

  return (
    <a
      ref={ref}
      href={href}
      {...(target ? { target } : {})}
      {...(rel ? { rel } : {})}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        transform: `translate3d(${shift.x}px, ${shift.y}px, 0)`,
        ["--vg-x" as string]: `${pos.x}%`,
        ["--vg-y" as string]: `${pos.y}%`,
      }}
      className={cn(
        "vg-glow-button group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full px-8 text-[0.78rem] font-bold uppercase tracking-[0.14em] transition-[transform,box-shadow,background-color,color] duration-300 ease-out active:scale-[0.97] motion-reduce:transform-none",
        tone === "brand" &&
          "bg-cyan text-cyan-foreground shadow-glow hover:shadow-lift",
        tone === "outline" &&
          "border border-current/25 text-current hover:border-cyan hover:text-cyan",
        tone === "dark" && "bg-navy text-navy-foreground hover:bg-primary",
        className,
      )}
    >
      <span aria-hidden="true" className="vg-glow-button-halo" />
      <span aria-hidden="true" className="vg-glow-button-sheen" />
      <span className="relative z-10 inline-flex items-center gap-3">{children}</span>
    </a>
  );
}
