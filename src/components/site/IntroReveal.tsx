import { useEffect, useState } from "react";

const STORAGE_KEY = "rcs_intro_seen";

/**
 * First-visit intro: the brand approaches from depth, then lands toward the
 * site header as the website is revealed.
 * Shows once per browser session; skipped for reduced-motion users.
 */
export function IntroReveal() {
  // Default to "brand" so the overlay is already painted on first load
  // (SSR included) — repeat visitors get it removed immediately in the effect.
  const [phase, setPhase] = useState<"brand" | "land" | "done">("brand");

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
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    const t1 = window.setTimeout(() => setPhase("land"), 4800);
    const t2 = window.setTimeout(() => setPhase("done"), 6500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "done") return null;

  const name = "R COMPUTER SOLUTIONS";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden [perspective:1200px]"
    >
      <div
        className="absolute inset-0 bg-navy transition-opacity duration-[1700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ opacity: phase === "land" ? 0 : 1 }}
      />
      <div
        className="absolute inset-0 flex origin-center flex-col items-center justify-center transition-[transform,opacity,filter] duration-[1700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={
          phase === "land"
            ? {
                opacity: 0,
                filter: "blur(2px)",
                transform: "translate3d(-36vw,-43vh,500px) scale(0.2)",
              }
            : { opacity: 1, filter: "blur(0)", transform: "translate3d(0,0,0) scale(1)" }
        }
      >
        <div className="animate-intro-approach flex flex-col items-center">
          <img
            src="/logo-mark.png"
            alt=""
            className="h-20 w-20 md:h-28 md:w-28"
          />
          <p className="mt-6 flex overflow-hidden px-4 text-center font-display text-xl font-extrabold tracking-[0.08em] text-white md:text-4xl">
            {name.split("").map((ch, i) => (
              <span
                key={i}
                className="inline-block animate-fade-in"
                style={{
                  ["--rcs-duration" as string]: "0.7s",
                  animationDelay: `${0.65 + i * 0.085}s`,
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </p>
          <p
            className="mt-3 animate-fade-in text-[0.65rem] font-bold uppercase tracking-[0.35em] text-cyan md:text-xs"
            style={{
              ["--rcs-duration" as string]: "0.8s",
              animationDelay: "2.75s",
            }}
          >
            The IT Hub
          </p>
        </div>
      </div>
    </div>
  );
}
