import type { ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { IntroReveal } from "./IntroReveal";
import { siteQueryOptions, whatsappLink, enquiryMessage } from "@/lib/site-query";

export function SiteShell({ children }: { children: ReactNode }) {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const wa = site.settings["whatsapp"];

  return (
    <div className="flex min-h-screen flex-col">
      <IntroReveal />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {wa ? (
        <a
          href={whatsappLink(wa, enquiryMessage(site.settings["default_enquiry_message"]))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lift transition-transform hover:scale-110 active:scale-95 motion-reduce:transition-none"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      ) : null}
    </div>
  );
}

export function PageHero({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string | undefined;
  breadcrumb?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-soft text-foreground">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid-blueprint opacity-60" />
      <div className="container-page relative py-12 md:py-16">
        {breadcrumb ? <div className="mb-3 text-xs text-muted-foreground">{breadcrumb}</div> : null}
        <h1 className="font-editorial text-3xl md:text-5xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
