import { useEffect, useState } from "react";

import logoMark from "/logo-mark.png";

/**
 * Cinematic welcome intro: "WELCOME TO" opens wide, the R logo and name
 * zoom in from depth, "THE IT HUB" lands, then the camera dives straight
 * through the lockup (planet-entry style) into the homepage.
 * Pure CSS transforms — no JS animation cost, site stays fast.
 * Shown once per browser session; skipped for reduced-motion visitors.
 */
export function IntroReveal() {
  const [phase, setPhase] = useState<"brand" | "dive" | "done">("brand");

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem("rcs_intro_seen") === "1"
    ) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem("rcs_intro_seen", "1");
    const dive = window.setTimeout(() => setPhase("dive"), 5800);
    const done = window.setTimeout(() => setPhase("done"), 7400);
    return () => {
      window.clearTimeout(dive);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[999] overflow-hidden bg-navy transition-opacity ${
        phase === "dive" ? "pointer-events-none opacity-0 duration-[1600ms]" : "opacity-100 duration-700"
      }`}
      style={{ perspective: "900px" }}
    >
      <style>{`
        @keyframes rcs-track-in {
          0% { opacity: 0; letter-spacing: 0.05em; transform: translateY(14px); }
          100% { opacity: 1; letter-spacing: 0.4em; transform: translateY(0); }
        }
        @keyframes rcs-logo-zoom {
          0% { opacity: 0; transform: scale(0.15); filter: blur(6px); }
          60% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes rcs-name-zoom {
          0% { opacity: 0; transform: scale(0.4) translateY(10px); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes rcs-hub-in {
          0% { opacity: 0; transform: translateY(12px); letter-spacing: 0.1em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.5em; }
        }
        @keyframes rcs-line {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes rcs-shine {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
        }
        @keyframes rcs-ring {
          0% { opacity: 0.55; transform: scale(0.35); }
          100% { opacity: 0; transform: scale(1.6); }
        }
      `}</style>

      {/* ambient glow + rings */}
      <div className="absolute inset-0 grid-blueprint opacity-[0.08]" />
      <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div
        className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/25"
        style={{ animation: "rcs-ring 2.6s ease-out 1.2s both" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/15"
        style={{ animation: "rcs-ring 2.6s ease-out 2s both" }}
      />

      {/* planet-entry flash during dive */}
      <div
        className={`absolute inset-0 bg-cyan/40 blur-2xl transition-opacity duration-[900ms] ${
          phase === "dive" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* brand lockup */}
      <div
        className="relative flex h-full flex-col items-center justify-center px-6 text-center transition-all"
        style={
          phase === "dive"
            ? {
                transform: "scale(9) translate3d(0,0,900px)",
                filter: "blur(10px)",
                opacity: 0,
                transitionDuration: "1500ms",
                transitionTimingFunction: "cubic-bezier(0.55,0,1,0.45)",
              }
            : { transitionDuration: "700ms" }
        }
      >
        <p
          className="mb-6 text-[1.1rem] font-semibold uppercase text-cyan md:text-[1.5rem]"
          style={{ animation: "rcs-track-in 1.1s cubic-bezier(0.22,1,0.36,1) 0.25s both" }}
        >
          Welcome to
        </p>

        <img
          src={logoMark}
          alt=""
          className="h-24 w-24 md:h-32 md:w-32"
          style={{ animation: "rcs-logo-zoom 1.6s cubic-bezier(0.22,1,0.36,1) 0.9s both" }}
        />

        <div className="relative mt-6 overflow-hidden">
          <h1
            className="font-display text-[2rem] font-extrabold uppercase tracking-tight text-white md:text-[3.5rem]"
            style={{ animation: "rcs-name-zoom 1.4s cubic-bezier(0.22,1,0.36,1) 1.6s both" }}
          >
            R Computer <span className="text-cyan">Solutions</span>
          </h1>
          <span
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
            style={{ animation: "rcs-shine 1.6s ease-in-out 3.4s both" }}
          />
        </div>

        <p
          className="mt-4 text-[0.75rem] font-bold uppercase text-white/70 md:text-sm"
          style={{ animation: "rcs-hub-in 1s cubic-bezier(0.22,1,0.36,1) 4.15s both" }}
        >
          The IT Hub
        </p>
        <span
          className="mt-4 h-0.5 w-40 origin-center bg-cyan md:w-56"
          style={{ animation: "rcs-line 0.9s cubic-bezier(0.22,1,0.36,1) 4.4s both" }}
        />
      </div>
    </div>
  );
}
