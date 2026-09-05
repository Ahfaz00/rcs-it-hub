import { useEffect, useState } from "react";

const STORAGE_KEY = "rcs_intro_seen";

/**
 * First-visit cinematic intro: light rings warp outward while the brand
 * lockup rushes in from depth, a sheen sweeps the wordmark, then the whole
 * lockup lands toward the site header as the website is revealed.
 * Shows once per browser session; skipped for reduced-motion users.
 * Pure CSS transforms/opacity only — no layout work, no JS animation loop.
 */
export function IntroReveal() {
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
    const t1 = window.setTimeout(() => setPhase("land"), 3700);
    const t2 = window.setTimeout(() => setPhase("done"), 5000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "done") return null;

  const name = "R COMPUTER SOLUTIONS";
  const landing = phase === "land";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden [perspective:1000px]"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy transition-opacity duration-[1300ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ opacity: landing ? 0 : 1 }}
      />
      {/* Ambient light bloom */}
      <div
        className="absolute inset-0 radial-glow transition-opacity duration-[1300ms]"
        style={{ opacity: landing ? 0 : 1 }}
      />

      {/* Warping light rings — sense of travelling through depth */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
        style={{ opacity: landing ? 0 : 1 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="animate-intro-warp absolute aspect-square w-[70vmin] rounded-full border border-cyan/25"
            style={{ animationDelay: `${i * 0.42}s` }}
          />
        ))}
        <span className="animate-intro-ring absolute aspect-square w-[46vmin] rounded-full border border-white/10" />
      </div>

      {/* Brand lockup */}
      <div
        className="absolute inset-0 flex origin-center flex-col items-center justify-center transition-[transform,opacity,filter] duration-[1300ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={
          landing
            ? {
                opacity: 0,
                filter: "blur(2px)",
                transform: "translate3d(-36vw,-43vh,420px) scale(0.2)",
              }
            : { opacity: 1, filter: "blur(0)", transform: "translate3d(0,0,0) scale(1)" }
        }
      >
        <div className="animate-intro-approach flex flex-col items-center">
          <p
            className="animate-intro-welcome mb-5 text-[0.6rem] font-bold uppercase text-cyan md:text-[0.7rem]"
            style={{ animationDelay: "0.25s" }}
          >
            Welcome to
          </p>

          <img src="/logo-mark.png" alt="" className="h-20 w-20 md:h-28 md:w-28" />

          <div className="relative mt-6 overflow-hidden">
            <p className="flex px-4 text-center font-display text-xl font-extrabold tracking-[0.08em] text-white md:text-4xl">
              {name.split("").map((ch, i) => (
                <span
                  key={i}
                  className="inline-block animate-fade-in"
                  style={{
                    ["--rcs-duration" as string]: "0.5s",
                    animationDelay: `${0.5 + i * 0.045}s`,
                  }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </p>
            <span className="animate-intro-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          </div>

          <p
            className="mt-4 animate-fade-in text-[0.65rem] font-bold uppercase tracking-[0.35em] text-cyan md:text-xs"
            style={{
              ["--rcs-duration" as string]: "0.6s",
              animationDelay: "2.15s",
            }}
          >
            The IT Hub
          </p>
          <span
            className="mt-5 block h-px w-0 animate-[rcs-intro-line_1s_cubic-bezier(0.22,1,0.36,1)_2.4s_forwards] bg-gradient-to-r from-transparent via-cyan to-transparent"
            style={{ animationFillMode: "forwards" }}
          />
        </div>
      </div>
    </div>
  );
}
