import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Boxes, ClipboardCheck, Quote, ShieldCheck, Star, Truck } from "lucide-react";

import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { Icon } from "@/components/site/Icon";
import { Reveal } from "@/components/site/Reveal";
import { FadeIn, Stagger, StaggerItem } from "@/components/site/Motion";

import { HeroSlider, type HeroSlide } from "@/components/site/HeroSlider";
import { CategoryShowcase, type ShowcaseItem } from "@/components/site/CategoryShowcase";
import { MotionProvider, readBool, readNum, useMotion } from "@/components/site/MotionProvider";
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
import slider1 from "@/assets/slider1.jpg.asset.json";
import slider2 from "@/assets/slider2.jpg.asset.json";
import slider3 from "@/assets/slider3.jpg.asset.json";
import slider4 from "@/assets/slider4_1.jpg.asset.json";
import slider5 from "@/assets/slider5_1.jpg.asset.json";
import slider6 from "@/assets/slider6.jpg.asset.json";

const heroSlides: HeroSlide[] = [
  { src: slider6.url, alt: "Rows of refurbished laptops under testing", caption: "Every unit bench-tested before dispatch" },
  { src: slider5.url, alt: "Refurbished business laptops stacked for grading", caption: "Graded, cleaned and inspected" },
  { src: slider4.url, alt: "Stacks of refurbished desktop CPUs", caption: "Desktops and workstations in volume" },
  { src: slider1.url, alt: "Palletised IT hardware stock in the warehouse", caption: "Warehouse stock, ready for bulk dispatch" },
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQueryOptions),
  component: HomePage,
});

function HomePage() {
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  return (
    <SiteShell>
      <MotionProvider settings={site.settings}>
        <HomeSections />
      </MotionProvider>
    </SiteShell>
  );
}

function HomeSections() {
  const { data: home } = useSuspenseQuery(homeQueryOptions);
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const motion = useMotion();
  const s = site.settings;
  const products = home.featured.length > 0 ? home.featured : home.latest;

  const showHero = readBool(s["section_hero_enabled"], true);
  const showShowcase = readBool(s["section_showcase_enabled"], true);
  const showTestimonials = readBool(s["section_testimonials_enabled"], true);
  const showFacility = readBool(s["section_facility_enabled"], true);
  const showCta = readBool(s["section_cta_enabled"], true);
  const heroInterval = readNum(s["hero_slider_interval_ms"], 5200, 1500, 30000);

  const showcaseItems: ShowcaseItem[] = site.categories.map((c, i) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.short_description,
    icon: c.icon,
    image: mediaUrl((c as { image_url?: string | null }).image_url) ?? heroSlides[i % heroSlides.length]!.src,
  }));

  return (
    <>
      {/* ============ HERO — editorial split, product-led ============ */}
      {showHero ? (
        <section className="relative isolate overflow-hidden bg-ink-ambient text-white">
          <div aria-hidden="true" className="absolute inset-0 grid-blueprint opacity-[0.12]" />
          <div className="container-page relative z-10 grid items-center gap-12 pb-16 pt-14 md:pb-24 md:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div>
              <FadeIn y={14}>
                <p className="text-eyebrow text-cyan">
                  R Computer Solutions <span className="text-white/40">•</span> The IT Hub
                </p>
              </FadeIn>
              <FadeIn delay={0.08} y={20}>
                <h1 className="mt-7 font-display text-hero font-bold uppercase text-white">
                  {s["hero_title"] ? (
                    s["hero_title"]
                  ) : (
                    <>
                      Refurbished
                      <br />
                      <span className="text-cyan">Technology.</span>
                      <br />
                      Built to perform.
                    </>
                  )}
                </h1>
              </FadeIn>
              <FadeIn delay={0.16}>
                <p className="mt-7 max-w-md text-body-lg text-white/70">
                  {s["hero_subtitle"] ||
                    "Business-grade laptops, desktops and workstations — inspected, graded and bench-tested before dispatch."}
                </p>
              </FadeIn>
              <FadeIn delay={0.24}>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    asChild
                    size="lg"
                    className="group h-16 rounded-none bg-cyan px-9 text-[0.85rem] font-bold uppercase tracking-[0.14em] text-cyan-foreground transition-transform hover:bg-white active:scale-[0.98] sm:h-15"
                  >
                    <a href={safePath(s["hero_cta1_link"], "/products")}>
                      {s["hero_cta1_text"] || "Explore laptops"}
                      <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-16 rounded-none border border-white/25 px-9 text-[0.85rem] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-cyan hover:bg-white/5 hover:text-cyan active:scale-[0.98] sm:h-15"
                  >
                    <a href={safePath(s["hero_cta2_link"], "/bulk-orders")}>
                      {s["hero_cta2_text"] || "Get a quote"}
                    </a>
                  </Button>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.18} y={26} className="relative">
              <div className="relative overflow-hidden shadow-lift">
                <HeroSlider
                  slides={heroSlides}
                  interval={heroInterval}
                  showCaption={false}
                  showDots
                  overlay={false}
                  className="aspect-4/3 w-full"
                />
              </div>
            </FadeIn>
          </div>
        </section>
      ) : null}


      {/* ============ BRAND MARQUEE ============ */}
      {home.brands.length > 0 ? (
        <div className="overflow-hidden border-y border-border bg-card py-5">
          <div className="group flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex w-max items-center gap-14 pr-14 group-hover:[animation-play-state:paused]">
              {[...home.brands, ...home.brands, ...home.brands].map((b, i) => (
                <span
                  key={`${b.slug}-${i}`}
                  className="flex items-center gap-14 whitespace-nowrap font-display text-lg font-bold uppercase tracking-[0.1em] text-muted-foreground/70 md:text-xl"
                >
                  {b.name}
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* ============ TRUST STRIP — thin, no cards ============ */}
      <div className="border-b border-border bg-background">
        <Stagger className="container-page grid divide-y divide-border py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {[
            { icon: ClipboardCheck, title: "Quality tested" },
            { icon: ShieldCheck, title: "Warranty support" },
            { icon: Boxes, title: "Bulk orders" },
            { icon: Truck, title: "Pan-India delivery" },
          ].map((t) => (
            <StaggerItem key={t.title} className="flex items-center gap-3 py-5 lg:justify-center lg:px-4">
              <t.icon className="h-4.5 w-4.5 shrink-0 text-primary" />
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-foreground">
                {t.title}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* ============ CATEGORIES — asymmetric editorial ============ */}
      {showShowcase && showcaseItems.length > 0 ? (
        <section className="container-page section-y">
          <SectionHeading
            eyebrow={s["showcase_eyebrow"] || "Shop by category"}
            title={s["showcase_title"] || "Hardware for every requirement"}
            action={{ to: "/products", label: "View all products" }}
          />
          <CategoryShowcase items={showcaseItems} />
        </section>
      ) : null}

      {/* ============ THE CURRENT STOCK ============ */}
      {products.length > 0 ? (
        <section className="border-y border-border bg-surface section-y">
          <div className="container-page">
            <SectionHeading
              eyebrow={s["featured_eyebrow"] || "In stock now"}
              title={s["featured_title"] || "The current stock"}
              action={{ to: "/products", label: "See all" }}
            />
            <Stagger className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
              {products.slice(0, 8).map((p) => (
                <StaggerItem key={p.id} className="h-full [&>*]:h-full">
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* ============ WHY US — editorial, image + list ============ */}
      <section className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <FadeIn y={20}>
            <figure className="relative overflow-hidden">
              <img
                src={heroSlides[1]!.src}
                alt="Refurbished laptops being graded at our facility"
                loading="lazy"
                decoding="async"
                className="aspect-4/5 w-full object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-navy/10" />
            </figure>
          </FadeIn>

          <div>
            <FadeIn>
              <p className="text-eyebrow text-primary">Why buy from us</p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-bold uppercase leading-[0.98] tracking-[-0.03em]">
                Built on testing.
                <br />
                Backed by experience.
              </h2>
            </FadeIn>
            <Stagger className="mt-10 divide-y divide-border border-y border-border" stagger={0.06}>
              {[
                { title: "Quality testing", text: "Display, battery, ports, storage, memory and thermals checked on every unit." },
                { title: "Honest grading", text: "Devices are described exactly as they are, with condition notes on every listing." },
                { title: "Business-ready hardware", text: "Configurations matched to real office, design and development workloads." },
                { title: "Bulk supply", text: "Volume availability for corporates, startups, institutions and resellers." },
                { title: "After-sales support", text: "Repair, upgrades and AMC handled in-house by our own team." },
              ].map((row) => (
                <StaggerItem key={row.title}>
                  <div className="grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                    <p className="font-display text-sm font-bold uppercase tracking-[0.12em]">{row.title}</p>
                    <p className="text-body text-muted-foreground">{row.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <FadeIn delay={0.1}>
              <Link
                to="/about"
                className="group mt-8 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-foreground hover:text-primary"
              >
                About our process
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============ PROCESS — horizontal numbered ============ */}
      <section className="border-y border-border bg-background section-y">
        <div className="container-page">
          <FadeIn>
            <p className="text-eyebrow text-primary">Our process</p>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(1.9rem,4vw,3rem)] font-bold uppercase leading-[1] tracking-[-0.03em]">
              How every unit reaches your desk
            </h2>
          </FadeIn>

          <Stagger className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-6" stagger={0.09}>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-6 hidden h-px bg-border lg:block"
            />
            {[
              { n: "01", title: "Source", text: "Corporate buy-backs and trade partners." },
              { n: "02", title: "Inspect", text: "Cosmetic and functional inspection." },
              { n: "03", title: "Refurbish", text: "Cleaning, part replacement, upgrades." },
              { n: "04", title: "Test", text: "Bench testing across all components." },
              { n: "05", title: "Quality check", text: "Final grading and condition notes." },
              { n: "06", title: "Dispatch", text: "Packed and shipped with GST invoice." },
            ].map((step) => (
              <StaggerItem key={step.n}>
                <div className="relative">
                  <span className="relative z-10 block bg-background pr-3 font-display text-4xl font-bold tracking-tight text-primary/25 transition-colors lg:text-5xl">
                    {step.n}
                  </span>
                  <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-[0.14em]">{step.title}</h3>
                  <p className="mt-2 text-body text-muted-foreground">{step.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ WORKSTATION — dark dramatic ============ */}
      <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
        <img
          src={heroSlides[2]!.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,oklch(0.78_0.14_217/0.28),transparent_65%)]"
        />
        <div className="container-page relative grid gap-10 section-y lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <FadeIn>
            <p className="text-eyebrow text-cyan">Workstations</p>
            <h2 className="mt-5 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold uppercase leading-[0.96] tracking-[-0.035em] text-white">
              Power when performance matters.
            </h2>
            <p className="mt-6 max-w-lg text-body-lg text-white/70">
              Xeon and Core workstations for design, engineering and development teams — configured,
              tested and supplied in volume.
            </p>
            <Button
              asChild
              size="lg"
              className="group mt-9 h-14 rounded-none bg-cyan px-8 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-cyan-foreground hover:bg-white"
            >
              <Link to="/products">
                Browse workstations
                <ArrowUpRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
          </FadeIn>

          <Stagger className="grid gap-px bg-white/12 sm:grid-cols-2" stagger={0.07}>
            {[
              { k: "Workstations", v: "Tower & mobile" },
              { k: "Desktops", v: "Business grade" },
              { k: "Laptops", v: "Enterprise series" },
              { k: "Support", v: "Repair · AMC · Rental" },
            ].map((c) => (
              <StaggerItem key={c.k}>
                <div className="h-full bg-navy p-6">
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-cyan">{c.k}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-white">{c.v}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ SERVICES — minimal list ============ */}
      {site.services.length > 0 ? (
        <section className="container-page section-y">
          <SectionHeading eyebrow="What we do" title="Services beyond the sale" action={{ to: "/services", label: "All services" }} />
          <div className="mt-10 grid divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
            {site.services.slice(0, 6).map((service, i) => (
              <Reveal key={service.id} delay={(i % 3) * motion.stagger}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="group flex h-full flex-col border-border p-7 transition-colors hover:bg-surface sm:border-b lg:border-r"
                >
                  <Icon name={service.icon} className="h-6 w-6 text-primary" />
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-body text-muted-foreground">{service.short_description}</p>
                  <ArrowRight className="mt-5 h-4 w-4 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ============ B2B ============ */}
      <section className="border-y border-border bg-surface section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
          <FadeIn>
            <p className="text-eyebrow text-primary">Bulk &amp; corporate</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.4rem)] font-bold uppercase leading-[0.98] tracking-[-0.03em]">
              Your IT procurement partner.
            </h2>
            <p className="mt-6 max-w-lg text-body-lg text-muted-foreground">
              Share your requirement — quantity, configuration and budget — and we revert with availability
              and pricing. GST invoicing, bulk dispatch and AMC support available.
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {["Corporate", "Startups", "Institutions", "Resellers", "Bulk orders"].map((t) => (
                <li key={t} className="text-[0.74rem] font-bold uppercase tracking-[0.14em] text-foreground">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="group h-14 rounded-none bg-navy px-8 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-navy-foreground hover:bg-primary"
              >
                <Link to="/bulk-orders">
                  Request bulk quote
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-14 rounded-none border-b-2 border-foreground/20 px-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] hover:border-primary hover:bg-transparent hover:text-primary"
              >
                <Link to="/contact">Talk to our team</Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} y={22}>
            <img
              src={heroSlides[3]!.src}
              alt="Bulk IT hardware stock ready for corporate dispatch"
              loading="lazy"
              decoding="async"
              className="aspect-4/3 w-full object-cover shadow-lift"
            />
          </FadeIn>
        </div>
      </section>

      {/* ============ BRANDS ============ */}
      {home.brands.length > 0 ? (
        <section className="container-page section-y">
          <SectionHeading eyebrow="Shop by brand" title="Brands we supply" />
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
            {home.brands.map((b, i) => (
              <Reveal key={b.slug} direction="scale" delay={i * Math.round(motion.stagger * 0.75)}>
                <Link
                  to="/products"
                  search={{ brand: b.slug }}
                  className="flex h-24 items-center justify-center bg-background font-display text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-navy hover:text-navy-foreground"
                >
                  {b.name}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ============ TESTIMONIALS ============ */}
      {showTestimonials && home.testimonials.length > 0 ? (
        <section className="border-y border-border bg-background section-y">
          <div className="container-page">
            <SectionHeading
              eyebrow={s["testimonials_eyebrow"] || "Customer feedback"}
              title={s["testimonials_title"] || "What buyers say"}
            />
            <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-3">
              {home.testimonials.slice(0, 3).map((t, i) => (
                <Reveal key={t.id} delay={i * motion.stagger} className="h-full">
                  <figure className="flex h-full flex-col bg-background p-8">
                    <Quote className="h-6 w-6 text-primary/40" />
                    <blockquote className="mt-5 flex-1 text-body-lg text-foreground/85">
                      {t.review}
                    </blockquote>
                    <figcaption className="mt-7">
                      <p className="font-display text-sm font-bold uppercase tracking-[0.12em]">{t.customer_name}</p>
                      {t.company ? <p className="mt-1 text-xs text-muted-foreground">{t.company}</p> : null}
                      {t.rating ? (
                        <div className="mt-2 flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                          {Array.from({ length: t.rating }).map((_, si) => (
                            <Star key={si} className="h-3.5 w-3.5 fill-primary text-primary" />
                          ))}
                        </div>
                      ) : null}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ FAQ ============ */}
      {home.faqs.length > 0 ? (
        <section className="container-page grid gap-10 section-y lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <FadeIn>
            <p className="text-eyebrow text-primary">Questions</p>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] font-bold uppercase leading-[1] tracking-[-0.03em]">
              Frequently asked
            </h2>
            <Link
              to="/faq"
              className="group mt-6 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] hover:text-primary"
            >
              All FAQs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </FadeIn>
          <Accordion type="single" collapsible className="w-full">
            {home.faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="py-5 text-left font-display text-base font-semibold tracking-tight">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-body text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}

      {/* ============ FACILITY MARQUEE ============ */}
      {showFacility ? (
        <section className="overflow-hidden border-y border-border bg-card py-14">
          <div className="container-page">
            <p className="text-eyebrow text-primary">
              {s["facility_eyebrow"] || "Inside our facility"}
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-bold uppercase leading-[1] tracking-[-0.03em]">
              {s["facility_title"] || "Stock, testing benches and dispatch"}
            </h2>
          </div>
          <div className="group relative mt-10 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div className="animate-marquee flex w-max gap-3 pr-3 group-hover:[animation-play-state:paused]">
              {[...heroSlides, ...heroSlides].map((slide, i) => (
                <figure
                  key={`${slide.src}-${i}`}
                  className="relative h-52 w-72 shrink-0 overflow-hidden md:h-64 md:w-96"
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transition-none"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ CTA ============ */}
      {showCta ? (
        <section className="bg-navy text-navy-foreground">
          <Reveal className="container-page flex flex-col items-start gap-6 section-y">
            <h2 className="max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-bold uppercase leading-[1] tracking-[-0.03em] text-white">
              {s["cta_title"] || "Need a bulk quote or a specific configuration?"}
            </h2>
            <p className="max-w-2xl text-body-lg text-white/70">
              {s["cta_text"] ||
                "Send us your requirement and we will come back with availability, configuration options and pricing."}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="group h-14 rounded-none bg-cyan px-8 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-cyan-foreground hover:bg-white"
              >
                <a href={safePath(s["cta_button1_link"], "/bulk-orders")}>
                  {s["cta_button1_text"] || "Request a quote"}
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-14 rounded-none border-b-2 border-white/25 px-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-white hover:border-cyan hover:bg-transparent hover:text-cyan"
              >
                <a href={safePath(s["cta_button2_link"], "/contact")}>{s["cta_button2_text"] || "Contact us"}</a>
              </Button>
            </div>
          </Reveal>
        </section>
      ) : null}
    </>
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
    <FadeIn>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="text-eyebrow text-primary">{eyebrow}</p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,3.1rem)] font-bold uppercase leading-[1] tracking-[-0.03em]">
            {title}
          </h2>
        </div>
        {action ? (
          <Link
            to={action.to}
            className="group inline-flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
          >
            {action.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>
    </FadeIn>
  );
}
