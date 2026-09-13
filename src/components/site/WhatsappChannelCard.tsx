import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Megaphone } from "lucide-react";

import { siteQueryOptions } from "@/lib/site-query";
import { cn } from "@/lib/utils";

const FALLBACK_CHANNEL = "https://whatsapp.com/channel/0029Vajg1lR1CYoR3VVXQm02";

export function WhatsappChannelCard({ className }: { className?: string }) {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const link = site.settings["whatsapp_channel"] || FALLBACK_CHANNEL;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-success/30 bg-success/10 p-5 transition-colors hover:border-success/60 sm:p-6",
        className,
      )}
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
        <span className="absolute inset-0 animate-ping rounded-full bg-success/40 motion-reduce:animate-none" />
        <Megaphone className="relative h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-eyebrow text-success">Daily stock updates</p>
        <p className="mt-1 font-display text-[1.05rem] font-bold leading-snug sm:text-[1.2rem]">
          Join our WhatsApp channel for dealers &amp; bulk buyers
        </p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          Fresh laptop, desktop, processor and RAM lots posted daily — before the stock moves.
        </p>
      </div>
      <ArrowUpRight className="ml-auto hidden h-5 w-5 shrink-0 text-success transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block" />
    </a>
  );
}
