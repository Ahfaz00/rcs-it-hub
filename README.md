# R Computer Solutions — The IT Hub

Production website and admin CMS for **R Computer Solutions**, a computer wholesaler
specialising in refurbished / pre-owned laptops, desktops, workstations, monitors,
accessories, IT hardware, repair, AMC, rental and bulk IT solutions.

**Location:** Abhinav Building, 1st Floor, EL 107, Electronic Zone, TTC Industrial
Area, Mahape, Navi Mumbai 400710

## What's inside

- **Public website** — homepage, product catalogue with search/filters, product
  detail pages, collections, brands, services, bulk orders, gallery, videos, blog,
  FAQ, contact and legal pages.
- **Admin panel** (`/admin`) — full CMS: products, categories, brands, services,
  testimonials, FAQs, gallery, pages, enquiries pipeline, settings, SEO manager,
  activity logs and dashboard analytics.
- **Enquiry-first commerce** — prices are quote-based ("Contact for Price") with
  WhatsApp / call CTAs. No checkout.

## Tech stack

- React 19 + TypeScript + Vite (TanStack Start, SSR)
- Tailwind CSS v4 + shadcn/ui
- TanStack Router + TanStack Query
- PostgreSQL database with row-level security, auth and file storage
- Server functions for backend logic; API routes under `src/routes/api/`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

See `DEPLOYMENT.md` for hosting notes.
