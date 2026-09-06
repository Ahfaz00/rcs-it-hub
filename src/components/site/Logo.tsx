import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  inverted = false,
  compact = false,
}: {
  className?: string;
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn("flex min-w-0 items-center gap-2 sm:shrink-0 sm:gap-3", className)}
      aria-label="R Computer Solutions home"
    >
      <img
        src="/logo-mark.png"
        alt=""
        width={44}
        height={44}
        className={cn("h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10", compact && "h-8 w-8")}
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "truncate font-display text-[0.82rem] font-bold sm:text-lg",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          R Computer Solutions
        </span>
        <span
          className={cn(
            "mt-1 truncate text-[0.55rem] font-medium uppercase tracking-[0.12em] sm:text-[0.65rem] sm:tracking-[0.18em]",
            inverted ? "text-white/70" : "text-muted-foreground",
          )}
        >
          The IT Hub
        </span>
      </span>
    </Link>
  );
}
