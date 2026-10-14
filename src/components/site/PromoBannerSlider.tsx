import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MemoryStick, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site-query";

export function PromoBannerSlider({ interval = 5500 }: { interval?: number }) {
  const [buying, setBuying] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setBuying(v => !v), interval);
    return () => window.clearInterval(timer);
  }, [interval]);
  const Icon = buying ? MemoryStick : Boxes;
  return (
    <section aria-label="RAM SSD buying and hardware selling" className="border-b border-border bg-surface text-surface-foreground">
      <div className="container-page flex min-h-36 flex-wrap items-center gap-4 py-5 sm:min-h-28 sm:flex-nowrap">
        <Icon className="h-8 w-8 shrink-0 text-primary" />
        <div key={String(buying)} className="min-w-0 flex-1 animate-fade-in motion-reduce:animate-none">
          <p className="text-xs font-bold text-primary">{buying ? "WE BUY • ANY QUANTITY" : "WE SELL • ENQUIRE FOR AVAILABILITY"}</p>
          <p className="mt-1 font-display text-lg font-bold">{buying ? "Wanted: RAM & SSD stock" : "Refurbished laptops & IT hardware"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{buying ? "Any capacity. Working & non-working accepted. Immediate payment." : "Explore models and send your requirement for a wholesale quote."}</p>
        </div>
        <Button asChild size="sm">
          {buying ? <a target="_blank" rel="noopener noreferrer" href={whatsappLink("918691914641", "Hi, I have RAM / SSD stock to sell. Quantity: \nDetails: \nBest price: ")}>Send stock details<ArrowRight className="h-4 w-4" /></a> : <Link to="/products">View stock<ArrowRight className="h-4 w-4" /></Link>}
        </Button>
      </div>
    </section>
  );
}
