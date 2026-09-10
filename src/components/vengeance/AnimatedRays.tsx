import { cn } from "@/lib/utils";

/**
 * Vengeance-style scene field: soft animated light rays plus a fine grid.
 * Purely decorative, tuned for the light theme.
 */
export function AnimatedRays({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("vg-rays pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <span className="vg-ray vg-ray-1" />
      <span className="vg-ray vg-ray-2" />
      <span className="vg-ray vg-ray-3" />
      <span className="absolute inset-0 grid-blueprint opacity-40" />
      <span className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
