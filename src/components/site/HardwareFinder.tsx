import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Search } from "lucide-react";

import { siteQueryOptions, whatsappLink } from "@/lib/site-query";
import { cn } from "@/lib/utils";

type Usage = { id: string; label: string; hint: string; term: string };

const USAGES: Usage[] = [
  { id: "office", label: "Office & accounting", hint: "Tally, billing, email, browsing", term: "i5" },
  { id: "study", label: "Study & coding", hint: "College, programming, online classes", term: "i5 SSD" },
  { id: "design", label: "Design & workstation", hint: "CAD, editing, rendering", term: "workstation" },
  { id: "bulk", label: "Bulk / dealer stock", hint: "Lots for resale and corporates", term: "lot" },
];

export function HardwareFinder() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const [step, setStep] = useState(0);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [category, setCategory] = useState<{ name: string; slug: string } | null>(null);
  const wa = site.settings["whatsapp"];

  const steps = ["What will you use it for?", "Which type of hardware?", "Your matches"];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-4 sm:px-7">
        <Search className="h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-eyebrow text-primary">Find it in 3 steps</p>
          <p className="mt-1 truncate font-display text-[1.02rem] font-bold">{steps[step]}</p>
        </div>
        <div className="ml-auto flex shrink-0 gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s}
              aria-hidden="true"
              className={cn("h-1.5 w-6 rounded-full", i <= step ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {step === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {USAGES.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setUsage(u);
                  setStep(1);
                }}
                className="rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
              >
                <p className="text-[0.95rem] font-bold">{u.label}</p>
                <p className="mt-1 text-[0.8rem] text-muted-foreground">{u.hint}</p>
              </button>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {site.categories.slice(0, 8).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory({ name: c.name, slug: c.slug });
                  setStep(2);
                }}
                className="rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
              >
                <p className="text-[0.95rem] font-bold">{c.name}</p>
                {c.short_description ? (
                  <p className="mt-1 line-clamp-2 text-[0.8rem] text-muted-foreground">{c.short_description}</p>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <p className="flex flex-wrap items-center gap-2 text-[0.85rem] text-muted-foreground">
              <Check className="h-4 w-4 text-success" />
              <span className="font-semibold text-foreground">{usage?.label}</span>
              <span>+</span>
              <span className="font-semibold text-foreground">{category?.name}</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/products"
                search={{ category: category?.slug, search: usage?.term }}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-navy-foreground transition-colors hover:bg-primary"
              >
                See matching products <ArrowRight className="h-4 w-4" />
              </Link>
              {wa ? (
                <a
                  href={whatsappLink(
                    wa,
                    `Hi R Computer Solutions, I am looking for ${category?.name ?? "IT hardware"} for ${usage?.label ?? "my requirement"}. Please suggest options with price and availability.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-success/40 px-6 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-success transition-colors hover:bg-success/10"
                >
                  <MessageCircle className="h-4 w-4" /> Ask us
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="mt-5 inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
