import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";

export type MotionConfig = {
  /** Master switch from CMS settings. */
  enabled: boolean;
  /** Base reveal/transition duration in ms. */
  duration: number;
  /** Delay between staggered items in ms. */
  stagger: number;
  /** Ken Burns effect on hero slides. */
  kenburns: boolean;
};

export const defaultMotion: MotionConfig = {
  enabled: true,
  duration: 700,
  stagger: 80,
  kenburns: true,
};

const MotionContext = createContext<MotionConfig>(defaultMotion);

export function useMotion() {
  const config = useContext(MotionContext);
  const reduced = usePrefersReducedMotion();
  if (reduced) return { ...config, enabled: false, kenburns: false, duration: 0, stagger: 0 };
  return config;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Reads CMS settings and exposes animation config + CSS variables to the tree. */
export function MotionProvider({
  settings,
  children,
}: {
  settings: Record<string, string | null | undefined>;
  children: ReactNode;
}) {
  const config: MotionConfig = {
    enabled: readBool(settings["animations_enabled"], defaultMotion.enabled),
    duration: readNum(settings["animation_duration_ms"], defaultMotion.duration, 0, 3000),
    stagger: readNum(settings["animation_stagger_ms"], defaultMotion.stagger, 0, 600),
    kenburns: readBool(settings["animation_kenburns_enabled"], defaultMotion.kenburns),
  };

  const style = {
    "--rcs-duration": `${config.duration}ms`,
    "--rcs-marquee-duration": `${readNum(settings["facility_marquee_speed_s"], 28, 6, 180)}s`,
  } as CSSProperties;

  return (
    <MotionContext.Provider value={config}>
      <div style={style} data-motion={config.enabled ? "on" : "off"}>
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export function readBool(value: string | null | undefined, fallback: boolean) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on", "enabled"].includes(value.trim().toLowerCase());
}

export function readNum(value: string | null | undefined, fallback: number, min: number, max: number) {
  const n = Number((value ?? "").trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
