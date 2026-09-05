import { useEffect, useState } from "react";

const STORAGE_KEY = "rcs_intro_seen";

/**
 * First-visit intro: brand name animates in on a deep navy screen,
 * then two "doors" slide apart to reveal the website (~2.5s total).
 * Shows once per browser session; skipped for reduced-motion users.
 */
export function IntroReveal() {
  const [phase, setPhase] = useState<"hidden" | "brand" | "open" | "done">("hidden");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = true;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      setPhase("done");
      return;
    }
    setPhase("brand");
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    const t1 = window.setTimeout(() => setPhase("open"), 1500);
    const t2 = window.setTimeout(() => setPhase("done"), 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "hidden" || phase === "done") return null;

  const name = "R COMPUTER SOLUTIONS";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      {/* Left door */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-navy transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: phase === "open" ? "translateX(-101%)" : "translateX(0)" }}
      />
      {/* Right door */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-navy transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: phase === "open" ? "translateX(101%)" : "translateX(0)" }}
      />
      {/* Brand layer */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500"
        style={{ opacity: phase === "open" ? 0 : 1 }}
      >
        <img
          src="/logo-mark.png"
          alt=""
          className="h-16 w-16 md:h-20 md:w-20 animate-fade-in"
          style={{ ["--rcs-duration" as string]: "0.6s" }}
        />
        <p className="mt-6 flex overflow-hidden font-display text-xl font-extrabold tracking-[0.08em] text-white md:text-4xl">
          {name.split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block animate-fade-in"
              style={{
                ["--rcs-duration" as string]: "0.45s",
                animationDelay: `${0.25 + i * 0.035}s`,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </p>
        <p
          className="mt-3 animate-fade-in text-[0.65rem] font-bold uppercase tracking-[0.35em] text-cyan md:text-xs"
          style={{
            ["--rcs-duration" as string]: "0.5s",
            animationDelay: "1s",
          }}
        >
          The IT Hub
        </p>
      </div>
      {/* Center seam light when doors open */}
      <div
        className="absolute inset-y-0 left-1/2 w-px bg-cyan/60 transition-opacity duration-300"
        style={{ opacity: phase === "open" ? 0 : 1 }}
      />
    </div>
  );
}
