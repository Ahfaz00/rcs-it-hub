import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ImageOff, MessageCircle, Phone } from "lucide-react";

import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { EnquiryDialog } from "@/components/site/EnquiryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/public.functions";
import { siteQueryOptions, whatsappLink, enquiryMessage } from "@/lib/site-query";
import { mediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/format";

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

  if (!data) return <ProductNotFound />;
  const { product, images, related } = data;

  const gallery = [
    ...(product.main_image_url
      ? [{ id: "main", image_url: product.main_image_url, alt_text: product.main_image_alt }]
      : []),
    ...images.filter((i) => i.image_url !== product.main_image_url),
  ];
  const activeImage = mediaUrl(gallery[active]?.image_url);

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

      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <div>
          <div className="group relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
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
                    i === active ? "border-accent shadow-card" : "border-border opacity-70 hover:opacity-100"
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
          <div className="flex flex-wrap items-center gap-2">
            {product.brands?.name ? <Badge variant="secondary">{product.brands.name}</Badge> : null}
            {product.condition ? (
              <Badge className="bg-accent text-accent-foreground">{product.condition}</Badge>
            ) : null}
            {product.sku ? <span className="text-xs text-muted-foreground">SKU {product.sku}</span> : null}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold">{product.name}</h1>
          {product.short_description ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.short_description}</p>
          ) : null}

          <div className="mt-6 rounded-lg border border-border bg-card p-5">
            <p className="font-display text-2xl font-bold">
              {formatPrice(product.price, product.show_price)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {product.availability}
              {product.warranty ? ` · ${product.warranty}` : ""}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <EnquiryDialog
                productId={product.id}
                productName={product.name}
                trigger={<Button size="lg">Enquire about this product</Button>}
              />
              {wa ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  <a
                    href={whatsappLink(
                      wa,
                      enquiryMessage(site.settings["default_enquiry_message"], product.name),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              ) : null}
              {phone ? (
                <Button asChild size="lg" variant="outline">
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          {product.condition_notes ? (
            <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
              <p className="font-semibold">Condition notes</p>
              <p className="mt-1 text-muted-foreground">{product.condition_notes}</p>
            </div>
          ) : null}

          {product.description ? (
            <div className="mt-6">
              <h2 className="font-display text-lg font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {specGroups.length > 0 ? (
        <section className="border-t border-border bg-surface py-12">
          <div className="container-page">
            <h2 className="font-display text-xl font-bold">Full specifications</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {specGroups.map((group) => (
                <div key={group.title} className="overflow-hidden rounded-lg border border-border bg-card">
                  <h3 className="border-b border-border bg-muted px-4 py-2.5 font-display text-sm font-semibold">
                    {group.title}
                  </h3>
                  <dl className="divide-y divide-border">
                    {group.rows.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="container-page py-14">
          <h2 className="font-display text-xl font-bold">Related products</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
