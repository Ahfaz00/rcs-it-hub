import { useEffect, useState } from "react";

import adDellImport from "@/assets/ad-dell-import.png.asset.json";
import adWholesaleStock from "@/assets/ad-wholesale-stock.png.asset.json";
import adServerRam from "@/assets/ad-server-ram.png.asset.json";
import adDesktopRam from "@/assets/ad-desktop-ram.png.asset.json";

type AdSlide = { src: string; alt: string };

const ADS: AdSlide[] = [
  {
    src: adDellImport.url,
    alt: "Dell Latitude pure import stock arrived — bulk laptops at R Computer Solutions",
  },
  {
    src: adDesktopRam.url,
    alt: "Desktop RAM bulk deal — high performance memory, big savings on bulk orders",
  },
  {
    src: adServerRam.url,
    alt: "Premium server RAM stock — DDR5 RDIMM wholesale inventory",
  },
  {
    src: adWholesaleStock.url,
    alt: "Wholesale IT stock — premium bulk inventory of used RAM and components",
  },
];

/**
 * Auto-sliding hero ad banner: cycles real offer creatives continuously.
 * Pure CSS crossfade — no JS animation cost; respects reduced motion.
 */
export function HeroAdSlider({ interval = 4200 }: { interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % ADS.length), interval);
    return () => window.clearInterval(timer);
  }, [interval]);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-6 bottom-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,oklch(0.78_0.14_217/0.22),transparent_70%)] blur-2xl"
      />
      <div className="relative z-10 mx-auto aspect-[16/10] w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-ambient shadow-[0_40px_60px_oklch(0.1_0.03_255/0.45)]">
        {ADS.map((ad, i) => (
          <img
            key={ad.src}
            src={ad.src}
            alt={ad.alt}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? "sync" : "async"}
            aria-hidden={i !== index}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="relative z-10 mt-3 flex justify-center gap-1.5">
        {ADS.map((ad, i) => (
          <button
            key={ad.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ad ${i + 1}`}
            aria-current={i === index}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-cyan" : "w-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
