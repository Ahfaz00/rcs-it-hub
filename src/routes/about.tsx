import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Wrench, HeartHandshake, Truck, BadgeCheck } from "lucide-react";

import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { getPageBySlug } from "@/lib/public.functions";
import { siteQueryOptions } from "@/lib/site-query";

const aboutQueryOptions = queryOptions({
  queryKey: ["page", "about"],
  queryFn: () => getPageBySlug({ data: { slug: "about" } }),
  staleTime: 60 * 1000,
});

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(aboutQueryOptions),
  head: () => ({
    meta: [
      { title: "About R Computer Solutions - The IT Hub, Navi Mumbai" },
      {
        name: "description",
        content:
          "R Computer Solutions - The IT Hub is a computer wholesaler in Navi Mumbai supplying refurbished laptops, desktops, workstations and IT hardware with repair, AMC and rental services.",
      },
      { property: "og:title", content: "About R Computer Solutions - The IT Hub" },
      {
        property: "og:description",
        content: "Computer wholesaler in Navi Mumbai for refurbished IT hardware, repair, AMC and rental.",
      },
      { name: "keywords", content: "about r computer solutions, computer wholesaler navi mumbai, refurbished laptop dealer navi mumbai, second hand laptop wholesaler india" },
      { property: "og:url", content: "https://rcs-it-hub.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://rcs-it-hub.lovable.app/about" }],
  }),
  component: AboutPage,
});

const PILLARS = [
  { Icon: ShieldCheck, title: "Rigorously tested", text: "Every device is quality-tested and refurbished to reliability standards." },
  { Icon: BadgeCheck, title: "Trusted brands", text: "HP, Dell and Lenovo hardware for individuals and businesses." },
  { Icon: Wrench, title: "Expert services", text: "Repair, AMC and rental support that keeps you running." },
  { Icon: Truck, title: "Pan-India dispatch", text: "Reliable dispatch of bulk and single orders nationwide." },
];

function AboutPage() {
  const { data: page } = useSuspenseQuery(aboutQueryOptions);
  const { data: site } = useSuspenseQuery(siteQueryOptions);

  return (
    <SiteShell>
      <PageHero
        title={page?.title ?? "About us"}
        subtitle={site.settings["tagline"] ?? "Computer wholesaler"}
      />

      {/* Welcome / story section */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid-blueprint opacity-40" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan/10 blur-[120px]" />

        <div className="container-page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="max-w-3xl">
            <Reveal>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.28em] text-primary">
                Welcome to
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-4 font-editorial text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl">
                R Computer <span className="text-primary">Solution</span>
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <span className="mt-5 block h-1 w-24 rounded-full bg-gradient-to-r from-primary to-cyan" />
            </Reveal>

            <div className="mt-8 space-y-6 text-[0.975rem] leading-relaxed text-muted-foreground md:text-base">
              <Reveal delay={160}>
                <p className="text-lg font-medium text-foreground md:text-xl">
                  At R Computer, we specialize in providing high-quality refurbished laptops, desktops,
                  and workstations from top brands like HP, Dell, and Lenovo.
                </p>
              </Reveal>
              <Reveal delay={220}>
                <p>
                  With a focus on affordability and performance, we ensure that every product undergoes
                  rigorous testing and refurbishment to meet the highest standards of reliability and
                  functionality. Whether you&rsquo;re a business seeking cost-effective IT solutions or an
                  individual looking for premium devices at competitive prices, we&rsquo;ve got you covered.
                  Our range of products is complemented by exceptional customer support and comprehensive
                  warranty options, giving you peace of mind with every purchase.
                </p>
              </Reveal>
              <Reveal delay={280}>
                <p>
                  Our mission is to bridge the gap between quality and affordability by delivering
                  refurbished technology solutions that empower growth and productivity. With years of
                  experience in the industry, we take pride in understanding the unique needs of our
                  clients and providing personalized solutions to meet their requirements. At R Computer,
                  we don&rsquo;t just sell products; we build long-term relationships by offering reliable
                  services, expert guidance, and a commitment to excellence. Join us in making technology
                  accessible and sustainable for everyone.
                </p>
              </Reveal>
              <Reveal delay={340}>
                <p>
                  We are dedicated to providing top-quality refurbished laptops, desktops, and
                  workstations from globally renowned brands like HP, Dell, and Lenovo. We understand that
                  reliable technology doesn&rsquo;t have to come at a premium price, which is why we focus on
                  delivering affordable yet high-performance products that cater to both individual users
                  and businesses.
                </p>
              </Reveal>
            </div>

            <Reveal delay={400}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 rounded-full px-7 text-[0.85rem] font-bold uppercase tracking-[0.1em]">
                  <Link to="/contact">
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-[0.85rem] font-bold uppercase tracking-[0.1em]">
                  <Link to="/products">Browse products</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Reach us card */}
          <Reveal delay={120} direction="left">
            <aside className="h-fit space-y-5 rounded-2xl border border-border bg-card p-7 shadow-card">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">Reach us</h3>
              </div>
              <dl className="space-y-4 text-sm">
                {site.settings["address"] ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</dt>
                    <dd className="mt-1 whitespace-pre-line font-medium text-foreground">{site.settings["address"]}</dd>
                  </div>
                ) : null}
                {site.settings["phone"] ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</dt>
                    <dd className="mt-1 font-medium text-foreground">{site.settings["phone"]}</dd>
                  </div>
                ) : null}
                {site.settings["email"] ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</dt>
                    <dd className="mt-1 break-all font-medium text-foreground">{site.settings["email"]}</dd>
                  </div>
                ) : null}
                {site.settings["business_hours"] ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business hours</dt>
                    <dd className="mt-1 font-medium text-foreground">{site.settings["business_hours"]}</dd>
                  </div>
                ) : null}
              </dl>
              <Button asChild className="h-11 w-full rounded-full">
                <Link to="/contact">Contact us</Link>
              </Button>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-b border-border bg-surface/60">
        <div className="container-page grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          {PILLARS.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-display text-base font-semibold text-foreground">{title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
