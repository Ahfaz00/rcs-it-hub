import { useEffect, useState } from "react";

/**
 * Picks the first candidate photo that is genuinely landscape (real product shots),
 * so portrait phone screenshots never become the hero visual.
 */
export function HeroProductImage({
  candidates,
  fallback,
}: {
  candidates: { src: string; alt: string }[];
  fallback: { src: string; alt: string };
}) {
  const [chosen, setChosen] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const measured: { c: { src: string; alt: string }; ratio: number }[] = [];
      for (const c of candidates) {
        const ratio = await new Promise<number>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.naturalWidth / Math.max(img.naturalHeight, 1));
          img.onerror = () => resolve(0);
          img.src = c.src;
        });
        if (cancelled) return;
        measured.push({ c, ratio });
      }
      const best = measured.filter((m) => m.ratio >= 1.15).sort((a, b) => b.ratio - a.ratio)[0];
      if (!cancelled) setChosen(best ? best.c : fallback);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [candidates, fallback]);

  const visual = chosen ?? fallback;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-6 bottom-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,oklch(0.78_0.14_217/0.22),transparent_70%)] blur-2xl"
      />
      <img
        src={visual.src}
        alt={visual.alt}
        fetchPriority="high"
        decoding="async"
        className="animate-float-slow relative z-10 mx-auto h-auto max-h-[22rem] w-auto max-w-full rounded-xl object-contain drop-shadow-[0_40px_60px_oklch(0.1_0.03_255/0.6)] sm:max-h-[24rem] lg:max-h-[30rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-16 bottom-2 h-10 rounded-[50%] bg-[radial-gradient(ellipse,oklch(0_0_0/0.45),transparent_70%)] blur-xl"
      />
    </div>
  );
}
