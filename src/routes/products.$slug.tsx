import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Expand, ImageOff, MessageCircle, Phone } from "lucide-react";

import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { EnquiryDialog } from "@/components/site/EnquiryDialog";
import { Lightbox, type LightboxImage } from "@/components/site/Lightbox";
import { MotionProvider } from "@/components/site/MotionProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { getProductBySlug } from "@/lib/public.functions";
import { siteQueryOptions, whatsappLink, enquiryMessage } from "@/lib/site-query";
import { mediaUrl } from "@/lib/media";
import { configChips, discountPercent, formatINR, formatPrice } from "@/lib/format";

const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQueryOptions(params.slug));
    if (!data) throw notFound();
    return { name: data.product.name, seo: data.product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.seo;
    const title = p.seo_title || `${p.name} | R Computer Solutions`;
    const description =
      p.seo_description ||
      p.short_description ||
      `Refurbished ${p.name} available from R Computer Solutions, Navi Mumbai. Contact us for price and availability.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(p.seo_keywords ? [{ name: "keywords", content: p.seo_keywords }] : []),
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductDetail,
});

function ProductNotFound() {
  return (
    <SiteShell>
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Product not available</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This product may have been sold or removed. Browse our current stock or send us your requirement.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/products">Browse products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/bulk-orders">Send requirement</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQueryOptions(slug));
  const { data: site } = useSuspenseQuery(siteQueryOptions);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!data) return <ProductNotFound />;
  const { product, images, related } = data;

  const gallery = [
    ...(product.main_image_url
      ? [{ id: "main", image_url: product.main_image_url, alt_text: product.main_image_alt }]
      : []),
    ...images.filter((i) => i.image_url !== product.main_image_url),
  ];
  const activeImage = mediaUrl(gallery[active]?.image_url);
  const lightboxImages: LightboxImage[] = gallery
    .map((g) => ({ src: mediaUrl(g.image_url) ?? "", alt: g.alt_text || product.name }))
    .filter((g) => g.src !== "");

  const specGroups: { title: string; rows: [string, unknown][] }[] = [
    {
      title: "Processor",
      rows: [
        ["Brand", product.processor_brand],
        ["Model", product.processor_model],
        ["Generation", product.processor_generation],
        ["Cores", product.cpu_cores],
        ["Threads", product.cpu_threads],
        ["Speed", product.cpu_speed],
      ],
    },
    {
      title: "Memory & Storage",
      rows: [
        ["RAM", product.ram],
        ["RAM type", product.ram_type],
        ["RAM speed", product.ram_speed],
        ["Maximum RAM", product.max_ram],
        ["Storage type", product.storage_type],
        ["Storage capacity", product.storage_capacity],
        ["Secondary storage", product.secondary_storage],
      ],
    },
    {
      title: "Display & Graphics",
      rows: [
        ["Display size", product.display_size],
        ["Resolution", product.display_resolution],
        ["Display type", product.display_type],
        ["Touchscreen", product.touchscreen ? "Yes" : null],
        ["Graphics", product.graphics_type],
        ["GPU", product.gpu_model],
        ["GPU memory", product.gpu_memory],
      ],
    },
    {
      title: "Connectivity & Build",
      rows: [
        ["Operating system", product.operating_system],
        ["Keyboard", product.keyboard],
        ["Ports", product.ports],
        ["Wi-Fi", product.wifi],
        ["Bluetooth", product.bluetooth],
        ["Webcam", product.webcam],
        ["Weight", product.weight],
        ["Colour", product.color],
        ["Dimensions", product.dimensions],
      ],
    },
    {
      title: "Condition & Warranty",
      rows: [
        ["Condition", product.condition],
        ["Grade", product.grade],
        ["Battery", product.battery_condition],
        ["Battery health", product.battery_health],
        ["Warranty", product.warranty],
        ["Warranty period", product.warranty_period],
        ["Accessories", product.accessories_included],
        ["Charger included", product.charger_available ? "Yes" : null],
        ["Box available", product.box_available ? "Yes" : null],
      ],
    },
  ]
    .map((g) => ({ ...g, rows: g.rows.filter(([, v]) => v != null && v !== "") as [string, unknown][] }))
    .filter((g) => g.rows.length > 0);

  const wa = site.settings["whatsapp"];
  const phone = site.settings["phone"];

  return (
    <SiteShell>
      <MotionProvider settings={site.settings}>
      {lightbox && lightboxImages.length > 0 ? (
        <Lightbox
          images={lightboxImages}
          index={Math.min(active, lightboxImages.length - 1)}
          onIndexChange={setActive}
          onClose={() => setLightbox(false)}
        />
      ) : null}
      <div className="border-b border-border bg-surface">
        <nav className="container-page py-3 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="px-1.5">/</span>
          <Link to="/products" className="hover:text-foreground">
            Products
          </Link>
          {product.categories?.slug ? (
            <>
              <span className="px-1.5">/</span>
              <Link
                to="/products"
                search={{ category: product.categories.slug }}
                className="hover:text-foreground"
              >
                {product.categories.name}
              </Link>
            </>
          ) : null}
          <span className="px-1.5">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container-page grid items-start gap-10 py-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="lg:sticky lg:top-28">
          <div className="group relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-soft shadow-card">
            <span aria-hidden="true" className="absolute inset-0 grid-blueprint opacity-70" />
            {activeImage ? (
              <>
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  aria-label="Open image viewer"
                  className="h-full w-full cursor-zoom-in"
                >
                  <img
                    key={activeImage}
                    src={activeImage}
                    alt={gallery[active]?.alt_text || product.name}
                    decoding="async"
                    className="animate-fade-in h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    width={800}
                    height={600}
                  />
                </button>
                <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-primary/80 px-3 py-1.5 text-xs font-medium text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Expand className="h-3.5 w-3.5" /> Click to zoom
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageOff className="h-10 w-10" />
                <p className="text-sm">Product photo coming soon</p>
                <p className="max-w-xs text-center text-xs">
                  Ask us for actual photos of this unit before you order.
                </p>
              </div>
            )}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActive(i)}
                  onDoubleClick={() => setLightbox(true)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === active}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border p-1 transition-all duration-300 hover:-translate-y-0.5 ${
                    i === active ? "border-primary ring-2 ring-primary/20 shadow-card" : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={mediaUrl(img.image_url) ?? ""}
                    alt={img.alt_text || ""}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {product.brands?.name ? (
            <p className="text-eyebrow text-primary">{product.brands.name}</p>
          ) : null}

          <h1 className="mt-3 font-display text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            {product.name}
          </h1>

          {configChips(product, 4).length > 0 ? (
            <p className="mt-4 text-body-lg text-muted-foreground">{configChips(product, 4).join("  ·  ")}</p>
          ) : product.short_description ? (
            <p className="mt-4 text-body-lg text-muted-foreground">{product.short_description}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {product.condition ? (
              <Badge className="rounded-none bg-navy px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-navy-foreground">
                {product.condition}
              </Badge>
            ) : null}
            {product.warranty ? (
              <span className="text-[0.95rem] text-muted-foreground">{product.warranty}</span>
            ) : null}
            {product.availability ? (
              <span className="text-[0.95rem] text-muted-foreground">· {product.availability}</span>
            ) : null}
          </div>

          <div className="mt-8 border-y border-border py-7">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold tracking-tight">
                {formatPrice(product.price, product.show_price)}
              </p>
              {product.show_price && product.mrp != null && Number(product.mrp) > Number(product.price ?? 0) ? (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatINR(Number(product.mrp))}
                  </span>
                  {discountPercent(product.price, product.mrp, product.discount) ? (
                    <span className="bg-success px-2.5 py-1 text-sm font-semibold text-success-foreground">
                      {discountPercent(product.price, product.mrp, product.discount)}% off
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {wa ? (
                <Button
                  asChild
                  size="lg"
                  className="h-15 rounded-none bg-success text-[0.8rem] font-bold uppercase tracking-[0.14em] text-success-foreground transition-transform hover:bg-success/90 active:scale-[0.98]"
                >
                  <a
                    href={whatsappLink(
                      wa,
                      enquiryMessage(site.settings["default_enquiry_message"], product.name),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                  </a>
                </Button>
              ) : null}
              <EnquiryDialog
                productId={product.id}
                productName={product.name}
                trigger={
                  <Button
                    size="lg"
                    className="h-15 w-full rounded-none bg-navy text-[0.8rem] font-bold uppercase tracking-[0.14em] text-navy-foreground transition-transform hover:bg-primary active:scale-[0.98]"
                  >
                    Request quote
                  </Button>
                }
              />
              {phone ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-15 rounded-none text-[0.8rem] font-bold uppercase tracking-[0.14em] sm:col-span-2"
                >
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>
                    <Phone className="mr-2 h-5 w-5" /> Call {phone}
                  </a>
                </Button>
              ) : null}
            </div>
            {product.sku ? (
              <p className="mt-5 text-sm text-muted-foreground">SKU {product.sku}</p>
            ) : null}
          </div>

          {product.condition_notes ? (
            <div className="mt-7 border-l-2 border-warning bg-warning/10 p-5">
              <p className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.1em]">
                Condition notes
              </p>
              <p className="mt-2 text-body text-muted-foreground">{product.condition_notes}</p>
            </div>
          ) : null}

          {product.description ? (
            <div className="mt-8">
              <h2 className="font-display text-sub font-semibold">Description</h2>
              <p className="mt-3 whitespace-pre-line text-body text-muted-foreground">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {specGroups.length > 0 ? (
        <section className="border-t border-border bg-surface section-y-sm">
          <div className="container-page">
            <p className="text-eyebrow text-primary">Specifications</p>
            <h2 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold tracking-tight">
              Full technical detail
            </h2>
            <Accordion
              type="multiple"
              defaultValue={[specGroups[0]!.title]}
              className="mt-8 border-t border-border"
            >
              {specGroups.map((group) => (
                <AccordionItem key={group.title} value={group.title} className="border-border">
                  <AccordionTrigger className="py-6 text-left font-display text-[1.05rem] font-semibold tracking-tight hover:no-underline">
                    {group.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-8">
                    <dl className="grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                      {group.rows.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="mt-1.5 text-[1.05rem] font-medium leading-snug">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      ) : null}


      {related.length > 0 ? (
        <section className="container-page section-y-sm">
          <p className="text-eyebrow text-primary">More options</p>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold tracking-tight">
            Related products
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      </MotionProvider>
    </SiteShell>
  );
}
