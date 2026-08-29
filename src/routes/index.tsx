import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Headphones,
  PackageCheck,
  Quote,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { Icon } from "@/components/site/Icon";
import { Reveal } from "@/components/site/Reveal";
import { HeroSlider, type HeroSlide } from "@/components/site/HeroSlider";
import { safePath } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getHomeData } from "@/lib/public.functions";
import { siteQueryOptions } from "@/lib/site-query";
import { mediaUrl } from "@/lib/media";
import heroFallback from "@/assets/hero-workshop.jpg";
import slider1 from "@/assets/slider1.jpg.asset.json";
import slider2 from "@/assets/slider2.jpg.asset.json";
import slider3 from "@/assets/slider3.jpg.asset.json";
import slider4 from "@/assets/slider4_1.jpg.asset.json";
import slider5 from "@/assets/slider5_1.jpg.asset.json";
import slider6 from "@/assets/slider6.jpg.asset.json";

const heroSlides: HeroSlide[] = [
  { src: slider1.url, alt: "Palletised IT hardware stock in the warehouse", caption: "Warehouse stock, ready for bulk dispatch" },
  { src: slider6.url, alt: "Rows of refurbished laptops under testing", caption: "Every unit bench-tested before dispatch" },
  { src: slider4.url, alt: "Stacks of refurbished desktop CPUs", caption: "Desktops and workstations in volume" },
  { src: slider5.url, alt: "Refurbished business laptops stacked for grading", caption: "Graded, cleaned and inspected" },
  { src: slider2.url, alt: "Spare parts and accessories racking", caption: "Spares, parts and accessories in stock" },
  { src: slider3.url, alt: "Accessories and peripherals storage room", caption: "Peripherals and add-ons for every build" },
];


const homeQueryOptions = queryOptions({
  queryKey: ["home-data"],
  queryFn: () => getHomeData(),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Refurbished Laptops, Desktops & Workstations | R Computer Solutions" },
      {
        name: "description",
        content:
          "R Computer Solutions - The IT Hub, Navi Mumbai. Wholesaler of quality tested refurbished laptops, desktops, workstations, monitors and IT hardware with bulk supply and pan-India delivery.",
      },
      {
        property: "og:title",
        content: "Refurbished Laptops, Desktops & Workstations | R Computer Solutions",
      },
      {
        property: "og:description",
        content:
          "Quality tested refurbished IT hardware from Navi Mumbai. Bulk orders, repair, AMC and rental services.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQueryOptions),
  component: HomePage,
});

function HomePage() {
  const { data: home } = useSuspenseQuery(homeQueryOptions);
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const s = site.settings;
  const heroImage = mediaUrl(s["hero_image"]) ?? heroFallback;
  const products = home.featured.length > 0 ? home.featured : home.latest;

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px]"
        />
        <div className="relative container-page grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p
              className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em]"
              style={{ animationDelay: "60ms" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Computer Wholesaler &middot; Navi Mumbai
            </p>
            <h1
              className="animate-fade-in mt-5 font-display text-4xl font-bold leading-tight md:text-5xl"
              style={{ animationDelay: "140ms" }}
            >
              {s["hero_title"] || "Quality Refurbished Technology. Built for Performance."}
            </h1>
            <p
              className="animate-fade-in mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/80 md:text-base"
              style={{ animationDelay: "220ms" }}
            >
              {s["hero_subtitle"]}
            </p>
            <div className="animate-fade-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>
              <Button asChild size="lg" className="sheen bg-accent text-accent-foreground hover:bg-accent/90">
                <a href={safePath(s["hero_cta1_link"], "/products")}>
                  {s["hero_cta1_text"] || "Browse Products"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href={safePath(s["hero_cta2_link"], "/bulk-orders")}>
                  {s["hero_cta2_text"] || "Get a Quote"}
                </a>
              </Button>
            </div>
          </div>

          <Reveal
            direction="scale"
            delay={200}
            className="animate-float overflow-hidden rounded-xl border border-primary-foreground/15 shadow-lift"
          >
            <HeroSlider slides={heroSlides} className="aspect-[4/3] w-full sm:aspect-[16/10]" />
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icon: ClipboardCheck, title: "Tested before dispatch", text: "Structured functional checks on every unit." },
            { Icon: ShieldCheck, title: "Warranty stated upfront", text: "Warranty terms listed on each product page." },
            { Icon: PackageCheck, title: "Bulk supply", text: "Volume orders with consistent configurations." },
            { Icon: Truck, title: "Pan-India delivery", text: "Dispatch across India from Navi Mumbai." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 90} className="flex gap-3">
              <item.Icon className="h-6 w-6 shrink-0 text-accent" />
              <div>
                <p className="font-display text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>


      {/* Categories */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Shop by category"
          title="Hardware for every requirement"
          action={{ to: "/products", label: "View all products" }}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group rounded-lg border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold group-hover:text-accent">{c.name}</h3>
              {c.short_description ? (
                <p className="mt-1.5 text-sm text-muted-foreground">{c.short_description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      {products.length > 0 ? (
        <section className="bg-surface py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="Current stock"
              title="Featured refurbished systems"
              action={{ to: "/products", label: "See all" }}
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Services */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="What we do"
          title="Services beyond the sale"
          action={{ to: "/services", label: "All services" }}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {site.services.slice(0, 6).map((service) => (
            <Link
              key={service.id}
              to="/services/$slug"
              params={{ slug: service.slug }}
              className="group rounded-lg border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
            >
              <Icon name={service.icon} className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-base font-semibold group-hover:text-accent">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Why buy from us</p>
            <h2 className="mt-3 font-display text-3xl font-bold">
              Honest grading, real testing, practical pricing
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">{s["footer_text"]}</p>
            <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/about">About our process</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { Icon: BadgeCheck, title: "Honest grading", text: "Devices described as they are, with condition notes." },
              { Icon: ClipboardCheck, title: "Structured testing", text: "Display, battery, ports, storage, memory and thermals." },
              { Icon: Headphones, title: "In-house support", text: "Repair, upgrades and AMC handled by our own team." },
              { Icon: PackageCheck, title: "GST invoicing", text: `Registered business${s["gst_number"] ? ` (GST ${s["gst_number"]})` : ""}.` },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-primary-foreground/15 p-5">
                <item.Icon className="h-5 w-5 text-accent" />
                <p className="mt-3 font-display text-sm font-semibold">{item.title}</p>
                <p className="mt-1.5 text-xs text-primary-foreground/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      {home.brands.length > 0 ? (
        <section className="container-page py-14">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Brands we supply
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {home.brands.map((b) => (
              <Link
                key={b.slug}
                to="/products"
                search={{ brand: b.slug }}
                className="rounded-md border border-border px-4 py-2 font-display text-sm font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {home.testimonials.length > 0 ? (
        <section className="bg-surface py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Customer feedback" title="What buyers say" />
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {home.testimonials.slice(0, 3).map((t) => (
                <figure key={t.id} className="rounded-lg border border-border bg-card p-6 shadow-card">
                  <Quote className="h-6 w-6 text-accent" />
                  <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {t.review}
                  </blockquote>
                  <figcaption className="mt-5 border-t border-border pt-4">
                    <p className="font-display text-sm font-semibold">{t.customer_name}</p>
                    {t.company ? <p className="text-xs text-muted-foreground">{t.company}</p> : null}
                    {t.rating ? (
                      <div className="mt-2 flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                        ))}
                      </div>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {home.faqs.length > 0 ? (
        <section className="container-page py-16">
          <SectionHeading eyebrow="Questions" title="Frequently asked" action={{ to: "/faq", label: "All FAQs" }} />
          <Accordion type="single" collapsible className="mt-8 max-w-3xl">
            {home.faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left text-sm font-medium">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}

      {/* CTA */}
      <section className="border-y border-border bg-accent/10">
        <div className="container-page flex flex-col items-center gap-5 py-12 text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Need a bulk quote or a specific configuration?
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Send us your requirement and we will come back with availability, configuration options and pricing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/bulk-orders">Request a quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{title}</h2>
      </div>
      {action ? (
        <Link
          to={action.to}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {action.label} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
