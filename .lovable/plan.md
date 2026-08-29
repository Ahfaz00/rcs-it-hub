# R Computer Solutions — Website + Admin CMS

A full production site for R Computer Solutions (The IT Hub), Navi Mumbai, with a complete admin panel so every product, page, image and setting is managed without touching code.

## Stack note (important)

This project runs on Lovable's fixed stack: React 19 + TypeScript + Vite + Tailwind + shadcn/ui + TanStack Router/Query + React Hook Form + Zod. Backend is Lovable Cloud (managed PostgreSQL, auth, storage) with server functions instead of a separate Express server. This is functionally equivalent to your Node/Express + PostgreSQL request, fully secure and server-side, and is what deploys reliably here. Everything else in your brief is built as specified.

## Confirmed business data

- R Computer Solutions / The IT Hub, tagline "Computer Wholesaler"
- Abhinav Building, 1st Floor, EL 107, Electronic Zone, TTC Industrial Area, Mahape, Navi Mumbai 400710
- GST 27BNDPR2219D1Z8, Phone +91 8691914641, Email theithub400709@gmail.com
- WhatsApp defaults to +91 8691914641 (editable in Admin > Settings)
- Admin account: theithub400709@gmail.com. Set the password yourself on first sign-in — I won't store the one you pasted in chat, and you should change it since chat isn't a secure channel.
- Uploaded logo/reference images become the brand assets and seed product images. The old site's US address, dummy email/phone, placeholder text and 0+ stats are dropped.

## Phase 1 — Database + public website

Database (UUID keys, created_at/updated_at, foreign keys, indexes on slug, SKU, category, brand, active, featured, enquiry status):
categories, brands, products, product_images, services, enquiries, contact_submissions, testimonials, gallery, pages, faqs, settings, seo_metadata, user_roles, activity_logs.

Row-level security: public read of active/published rows only; all writes admin-only via a roles table and a security-definer role check. Storage buckets for product, gallery and brand images with type/size validation.

Seed data: 8 categories, brands (Dell, HP, Lenovo, Apple, Acer, ASUS, Microsoft, Toshiba, Fujitsu, Samsung), the 3 migrated products (Dell Precision 5560, Dell Latitude 5490 with the corrected heading, HP Z840 Workstation) with no invented prices — they show "Contact for Price" — services, FAQs, About/legal page content, and settings.

Public pages: /, /about, /products (+ category and brand pages), /products/[slug], /services, /bulk-orders, /gallery, /contact, /faq, /warranty, legal pages, 404. Homepage follows your 16-section order. Product listing has full search, faceted filters and sorting driven by URL query params with pagination. Product detail has gallery with zoom/lightbox, spec tables, condition report, warranty, similar products, and WhatsApp/Call/Quote CTAs. Enquiry, quote-modal, callback and contact forms all validate with Zod and save to the database with their source recorded. Floating WhatsApp button with auto-generated product message.

Design: white/light base, deep navy sections, blue #0B5CFF / #1687FF / cyan #00C8FF accents as semantic tokens, rounded cards, restrained motion, mobile-first from 320px up.

SEO: per-route metadata, canonical URLs, Open Graph and Twitter cards, JSON-LD (Product, LocalBusiness, Breadcrumb), dynamic sitemap.xml and robots.txt, lazy-loaded responsive images with alt text.

## Phase 2 — Admin panel

Secure /admin behind email/password auth with an admin role check, protected routes, password reset and session handling. Sidebar layout with dashboard, and CRUD for:

- Products — table with search/filters, bulk actions, duplicate, featured and stock toggles, tabbed editor (Basic, Specs, Pricing, Inventory, Images, Warranty, SEO, Publishing), drag-and-drop multi-image uploader with reorder, main image and alt text
- Categories, Brands, Services, Testimonials, FAQ, Gallery (categorised, captions, reorder, featured)
- Enquiries and contact leads — status pipeline (New/Contacted/Quoted/Negotiating/Won/Lost/Closed), notes, follow-up date, source, call/WhatsApp/email actions
- Pages CMS — homepage sections (announcement bar, hero, USP cards, categories, process, quality, bulk CTA), About, Services, Contact, navigation, footer
- Settings — company details, contacts, logo, favicon, maps URL, socials, hours, default warranty and enquiry message
- SEO manager — global and per-page metadata, analytics IDs
- Dashboard cards, charts (by category, brand, enquiry status, monthly enquiries) and recent activity
- Activity logs for logins, content changes and uploads

## Phase 3 — Polish

CSV export for products, enquiries and contacts; "Import Old Website Assets" page listing the known old-site image URLs with preview and manual upload fallback; legal pages editable with neutral placeholder terms; accessibility pass (focus states, ARIA, contrast, keyboard nav); performance pass (code splitting, query caching, pagination, image optimisation); error states, skeletons and toasts throughout; deployment and backup notes.

## Ground rules held throughout

No invented prices, stock, warranty periods, reviews, certifications or statistics — missing data renders as "Contact for Price" / "Enquire for Availability". No hard-coded products or contact details in components. No manufacturer logos. Architecture leaves room for a future cart/checkout/Razorpay layer without rework.
