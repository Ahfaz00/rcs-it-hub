import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MessageCircle, Pause, Play } from "lucide-react";
import buyingPoster from "@/assets/ram-ssd-wanted.jpg.asset.json";
import { assetCdnUrl } from "@/lib/media";
import { whatsappLink } from "@/lib/site-query";
import { Button } from "@/components/ui/button";

const ADS = [
  { id: "buying", src: assetCdnUrl(buyingPoster.url), alt: "R Computer Solutions wanted: bulk RAM and SSD stock", label: "WE BUY", title: "RAM & SSD • Any quantity", detail: "DDR3 / DDR4 / DDR5 · SATA / NVMe · Any capacity", cta: "Sell your stock on WhatsApp" },
  { id: "selling", src: "/slider6.jpg", alt: "Refurbished laptops at R Computer Solutions", label: "WE SELL", title: "Business laptops & IT hardware", detail: "Laptops · Desktops · Workstations · Monitors", cta: "Explore current stock" },
];

export function HeroAdSlider({ interval = 5500 }: { interval?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % ADS.length), interval);
    return () => window.clearInterval(timer);
  }, [interval, paused]);
  const ad = ADS[index];
  if (!ad) return null;
  return (
    <div aria-label="Buying and selling advertisements" aria-roledescription="carousel" className="min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
        {ADS.map((item, i) => (
          <div key={item.id} aria-hidden={i !== index} className={`absolute inset-0 transition-transform duration-700 ease-in-out motion-reduce:transition-none ${i === index ? "translate-x-0" : i < index ? "-translate-x-full" : "translate-x-full"}`}>
            <img src={item.src} alt={item.alt} className={`h-full w-full ${item.id === "buying" ? "object-contain" : "object-cover"}`} loading="eager" />
          </div>
        ))}
      </div>
      <div className="mt-4 grid min-h-44 grid-cols-[minmax(0,1fr)_auto] gap-3">
        <div>
          <p className="text-xs font-bold text-cyan">{ad.label}</p>
          <p className="mt-1 font-display text-xl font-bold text-navy-foreground">{ad.title}</p>
          <p className="mt-2 text-sm text-navy-foreground/75">{ad.detail}</p>
          <Button asChild className="mt-4" variant="secondary">
            {ad.id === "buying" ? <a href={whatsappLink("918691914641", "Hi R Computer Solutions, I have RAM / SSD stock to sell. Type / capacity: \nQuantity: \nWorking or non-working: \nBest price: \nLocation: ")} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />{ad.cta}</a> : <Link to="/products">{ad.cta}<ArrowRight className="h-4 w-4" /></Link>}
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="secondary" size="icon" aria-label="Previous advertisement" onClick={() => setIndex(i => (i + ADS.length - 1) % ADS.length)}><ArrowLeft className="h-4 w-4" /></Button>
          <Button variant="secondary" size="icon" aria-label="Next advertisement" onClick={() => setIndex(i => (i + 1) % ADS.length)}><ArrowRight className="h-4 w-4" /></Button>
          <Button variant="secondary" size="icon" aria-label={paused ? "Play advertisements" : "Pause advertisements"} onClick={() => setPaused(v => !v)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
        </div>
      </div>
    </div>
  );
}
