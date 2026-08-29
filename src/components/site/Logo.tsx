import { Link } from "@tanstack/react-router";
import logoMark from "@/assets/logo-mark.png.asset.json";
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
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label="R Computer Solutions home">
      <img
        src={logoMark.url}
        alt=""
        width={44}
        height={44}
        className={cn("h-10 w-10 shrink-0 object-contain", compact && "h-8 w-8")}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-base font-bold tracking-tight sm:text-lg",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          R Computer Solutions
        </span>
        <span
          className={cn(
            "mt-1 text-[0.65rem] font-medium uppercase tracking-[0.18em]",
            inverted ? "text-white/70" : "text-muted-foreground",
          )}
        >
          The IT Hub
        </span>
      </span>
    </Link>
  );
}
