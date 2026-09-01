-- Categories: parent + banner
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

-- COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'manual',
  description text,
  short_description text,
  image_url text,
  banner_url text,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  seo_keywords text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections public read" ON public.collections FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "collections admin write" ON public.collections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_collections_updated BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, product_id)
);
GRANT SELECT ON public.collection_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_products TO authenticated;
GRANT ALL ON public.collection_products TO service_role;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collection products public read" ON public.collection_products FOR SELECT USING (true);
CREATE POLICY "collection products admin write" ON public.collection_products FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- USAGE TAGS
CREATE TABLE IF NOT EXISTS public.usage_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  short_description text,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.usage_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_tags TO authenticated;
GRANT ALL ON public.usage_tags TO service_role;
ALTER TABLE public.usage_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage tags public read" ON public.usage_tags FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "usage tags admin write" ON public.usage_tags FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_usage_tags_updated BEFORE UPDATE ON public.usage_tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.product_usage_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  usage_tag_id uuid NOT NULL REFERENCES public.usage_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, usage_tag_id)
);
GRANT SELECT ON public.product_usage_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_usage_tags TO authenticated;
GRANT ALL ON public.product_usage_tags TO service_role;
ALTER TABLE public.product_usage_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product usage public read" ON public.product_usage_tags FOR SELECT USING (true);
CREATE POLICY "product usage admin write" ON public.product_usage_tags FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ATTRIBUTES
CREATE TABLE IF NOT EXISTS public.attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  input_type text NOT NULL DEFAULT 'select',
  is_filterable boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.attributes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attributes TO authenticated;
GRANT ALL ON public.attributes TO service_role;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attributes public read" ON public.attributes FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "attributes admin write" ON public.attributes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_attributes_updated BEFORE UPDATE ON public.attributes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id uuid NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  value text NOT NULL,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attribute_id, slug)
);
GRANT SELECT ON public.attribute_values TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attribute_values TO authenticated;
GRANT ALL ON public.attribute_values TO service_role;
ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attribute values public read" ON public.attribute_values FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "attribute values admin write" ON public.attribute_values FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  eyebrow text,
  image_url text,
  mobile_image_url text,
  alt_text text,
  cta_text text,
  cta_link text,
  secondary_cta_text text,
  secondary_cta_link text,
  placement text NOT NULL DEFAULT 'hero',
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners public read" ON public.banners FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "banners admin write" ON public.banners FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_banners_updated BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BLOG
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog categories public read" ON public.blog_categories FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "blog categories admin write" ON public.blog_categories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_blog_categories_updated BEFORE UPDATE ON public.blog_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text,
  cover_image_url text,
  cover_image_alt text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_name text,
  tags text[],
  reading_minutes integer,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  seo_keywords text,
  canonical_url text,
  og_image text,
  robots text DEFAULT 'index,follow',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog posts public read" ON public.blog_posts FOR SELECT USING ((is_published AND (published_at IS NULL OR published_at <= now())) OR is_admin());
CREATE POLICY "blog posts admin write" ON public.blog_posts FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NEWSLETTER
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'Subscribed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admins update subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (is_admin());
CREATE TRIGGER trg_newsletter_updated BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCT REQUESTS
CREATE TABLE IF NOT EXISTS public.product_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  quantity text,
  budget text,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text,
  source text NOT NULL DEFAULT 'search',
  status text NOT NULL DEFAULT 'New',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.product_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_requests TO authenticated;
GRANT ALL ON public.product_requests TO service_role;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request product" ON public.product_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read product requests" ON public.product_requests FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admins update product requests" ON public.product_requests FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admins delete product requests" ON public.product_requests FOR DELETE TO authenticated USING (is_admin());
CREATE TRIGGER trg_product_requests_updated BEFORE UPDATE ON public.product_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEARCH ANALYTICS
CREATE TABLE IF NOT EXISTS public.search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_search_queries_term ON public.search_queries(term);
GRANT INSERT ON public.search_queries TO anon;
GRANT SELECT, INSERT, DELETE ON public.search_queries TO authenticated;
GRANT ALL ON public.search_queries TO service_role;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log search" ON public.search_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read searches" ON public.search_queries FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admins delete searches" ON public.search_queries FOR DELETE TO authenticated USING (is_admin());

-- REDIRECTS
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text NOT NULL UNIQUE,
  to_path text NOT NULL,
  status_code integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redirects TO authenticated;
GRANT ALL ON public.redirects TO service_role;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redirects public read" ON public.redirects FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "redirects admin write" ON public.redirects FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_redirects_updated BEFORE UPDATE ON public.redirects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NAVIGATION
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu text NOT NULL DEFAULT 'main',
  label text NOT NULL,
  href text NOT NULL,
  parent_id uuid REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.navigation_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.navigation_items TO authenticated;
GRANT ALL ON public.navigation_items TO service_role;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "navigation public read" ON public.navigation_items FOR SELECT USING (is_active OR is_admin());
CREATE POLICY "navigation admin write" ON public.navigation_items FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER trg_navigation_updated BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Product search/index support
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);

-- Seed budget + usage starting points
INSERT INTO public.collections (name, slug, kind, short_description, rules, sort_order, is_featured)
VALUES
  ('Best Sellers', 'best-sellers', 'manual', 'Most requested refurbished systems', '{}'::jsonb, 1, true),
  ('New Arrivals', 'new-arrivals', 'auto', 'Latest stock added to our floor', '{"type":"new"}'::jsonb, 2, true),
  ('Hot Deals', 'hot-deals', 'auto', 'Sharpest pricing available right now', '{"type":"discount"}'::jsonb, 3, true),
  ('Under 20,000', 'under-20000', 'budget', 'Reliable machines under Rs 20,000', '{"max":20000}'::jsonb, 4, true),
  ('Under 30,000', 'under-30000', 'budget', 'Business grade under Rs 30,000', '{"max":30000}'::jsonb, 5, true),
  ('Under 50,000', 'under-50000', 'budget', 'Performance systems under Rs 50,000', '{"max":50000}'::jsonb, 6, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.usage_tags (name, slug, short_description, sort_order)
VALUES
  ('Office Work', 'for-office', 'Everyday business productivity machines', 1),
  ('Students', 'for-students', 'Affordable, dependable study laptops', 2),
  ('Programming', 'for-programming', 'Developer-ready CPU and RAM configurations', 3),
  ('Trading', 'for-trading', 'Multi-monitor capable trading setups', 4),
  ('Graphic Design', 'for-design', 'Colour-accurate displays and GPU power', 5),
  ('Video Editing', 'for-video-editing', 'High core-count systems with fast storage', 6),
  ('Engineering / CAD', 'for-engineering', 'Certified workstations for CAD and simulation', 7)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blog_categories (name, slug, sort_order)
VALUES ('Buying Guides','buying-guides',1),('Refurbished Tech','refurbished-tech',2),('Business IT','business-it',3),('Hardware','hardware',4),('How-To','how-to',5)
ON CONFLICT (slug) DO NOTHING;