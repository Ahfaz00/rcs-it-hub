import type { ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { siteQueryOptions, whatsappLink, enquiryMessage } from "@/lib/site-query";

export function SiteShell({ children }: { children: ReactNode }) {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const wa = site.settings["whatsapp"];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {wa ? (
        <a
          href={whatsappLink(wa, enquiryMessage(site.settings["default_enquiry_message"]))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lift transition-transform hover:scale-105"
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
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="container-page py-12 md:py-16">
        {breadcrumb ? <div className="mb-3 text-xs text-primary-foreground/70">{breadcrumb}</div> : null}
        <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/80 md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
