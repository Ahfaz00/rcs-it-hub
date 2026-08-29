-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','editor','user');

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  IF lower(NEW.email) = 'theithub400709@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  image_url text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  seo_title text, seo_description text, seo_keywords text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_active ON public.categories(is_active);

-- ============ BRANDS ============
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  seo_title text, seo_description text, seo_keywords text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands public read" ON public.brands FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "brands admin write" ON public.brands FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER brands_updated BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_brands_slug ON public.brands(slug);

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory text,
  product_type text,
  condition text,
  grade text,
  processor_brand text, processor_model text, processor_generation text,
  cpu_cores text, cpu_threads text, cpu_speed text,
  ram text, ram_type text, ram_speed text, max_ram text,
  storage_type text, storage_capacity text, secondary_storage text,
  display_size text, display_resolution text, display_type text, touchscreen boolean DEFAULT false,
  graphics_type text, gpu_model text, gpu_memory text,
  operating_system text, keyboard text,
  battery_condition text, battery_health text,
  ports text, wifi text, bluetooth text, webcam text,
  weight text, color text, dimensions text,
  warranty text, warranty_period text, warranty_terms text,
  condition_notes text, accessories_included text,
  box_available boolean DEFAULT false, charger_available boolean DEFAULT false, original_charger boolean DEFAULT false,
  price numeric(12,2), mrp numeric(12,2), discount numeric(5,2), show_price boolean NOT NULL DEFAULT false,
  stock_quantity int NOT NULL DEFAULT 0,
  reserved_quantity int NOT NULL DEFAULT 0,
  minimum_stock int NOT NULL DEFAULT 0,
  availability text NOT NULL DEFAULT 'Enquire for Availability',
  is_featured boolean NOT NULL DEFAULT false,
  is_new_arrival boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  view_count int NOT NULL DEFAULT 0,
  short_description text, description text,
  seo_title text, seo_description text, seo_keywords text, canonical_url text,
  main_image_url text, main_image_alt text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);
CREATE INDEX idx_products_created ON public.products(created_at DESC);

-- ============ PRODUCT IMAGES ============
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order int NOT NULL DEFAULT 0,
  is_main boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product images public read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product images admin write" ON public.product_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX idx_product_images_product ON public.product_images(product_id);

-- ============ SERVICES ============
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  description text,
  icon text,
  image_url text,
  benefits text[],
  cta_text text, cta_link text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  seo_title text, seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ENQUIRIES ============
CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text,
  phone text NOT NULL,
  whatsapp text,
  email text,
  city text,
  requirement_type text,
  product_category text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text,
  quantity text,
  budget text,
  required_date date,
  preferred_time text,
  message text,
  attachment_url text,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'New',
  assigned_to text,
  admin_notes text,
  follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER enquiries_updated BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_enquiries_status ON public.enquiries(status);
CREATE INDEX idx_enquiries_created ON public.enquiries(created_at DESC);

-- ============ CONTACT SUBMISSIONS ============
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  subject text,
  message text,
  source text NOT NULL DEFAULT 'contact-page',
  status text NOT NULL DEFAULT 'New',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read contact" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update contact" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete contact" ON public.contact_submissions FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER contact_updated BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TESTIMONIALS ============
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  company text,
  designation text,
  review text NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5),
  photo_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials public read" ON public.testimonials FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "testimonials admin write" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER testimonials_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ GALLERY ============
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  caption text,
  category text NOT NULL DEFAULT 'General',
  image_url text NOT NULL,
  alt_text text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "gallery admin write" ON public.gallery FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER gallery_updated BEFORE UPDATE ON public.gallery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PAGES (CMS) ============
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  body text,
  is_published boolean NOT NULL DEFAULT true,
  seo_title text, seo_description text, seo_keywords text, canonical_url text, og_image text, robots text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pages public read" ON public.pages FOR SELECT USING (is_published OR public.is_admin());
CREATE POLICY "pages admin write" ON public.pages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER pages_updated BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FAQS ============
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'General',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs public read" ON public.faqs FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER faqs_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SETTINGS ============
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value text,
  group_name text NOT NULL DEFAULT 'general',
  label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEO METADATA ============
CREATE TABLE public.seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text, description text, keywords text,
  og_title text, og_description text, og_image text,
  canonical_url text, robots text DEFAULT 'index,follow',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_metadata TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_metadata TO authenticated;
GRANT ALL ON public.seo_metadata TO service_role;
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo public read" ON public.seo_metadata FOR SELECT USING (true);
CREATE POLICY "seo admin write" ON public.seo_metadata FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER seo_updated BEFORE UPDATE ON public.seo_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ACTIVITY LOGS ============
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  entity_label text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins write logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE INDEX idx_logs_created ON public.activity_logs(created_at DESC);

-- ============ STORAGE POLICIES ============
CREATE POLICY "media read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

-- ============ SEED: CATEGORIES ============
INSERT INTO public.categories (name, slug, short_description, description, icon, sort_order) VALUES
('Refurbished Laptops','laptops','Business-grade laptops, professionally tested.','Refurbished business laptops from Dell, HP, Lenovo and other trusted brands. Each unit is inspected and tested before delivery.','Laptop',1),
('Refurbished Desktops','desktops','Reliable desktops for office and home.','Refurbished desktop computers suitable for offices, institutions and everyday productivity.','Monitor',2),
('Workstations','workstations','High-performance workstations for demanding workloads.','Refurbished workstations for CAD, rendering, engineering and data workloads.','Cpu',3),
('Monitors','monitors','LCD and LED monitors in a range of sizes.','Refurbished and pre-owned monitors for office and workstation setups.','MonitorSmartphone',4),
('Accessories','accessories','Chargers, keyboards, mice, bags and more.','Computer accessories and peripherals for laptops and desktops.','Keyboard',5),
('Computer Parts','parts','RAM, SSDs, drives, adapters and components.','Computer components and spare parts for upgrades and repairs.','HardDrive',6),
('Servers','servers','Server hardware for business infrastructure.','Refurbished server hardware for small and medium business infrastructure.','Server',7),
('IT Services','it-services','Repair, AMC, rental and corporate IT support.','Repair, annual maintenance, rental and corporate IT services.','Wrench',8);

-- ============ SEED: BRANDS ============
INSERT INTO public.brands (name, slug, sort_order) VALUES
('Dell','dell',1),('HP','hp',2),('Lenovo','lenovo',3),('Apple','apple',4),('Acer','acer',5),
('ASUS','asus',6),('Microsoft','microsoft',7),('Toshiba','toshiba',8),('Fujitsu','fujitsu',9),('Samsung','samsung',10);

-- ============ SEED: PRODUCTS ============
INSERT INTO public.products (
  sku, name, slug, brand_id, category_id, product_type, condition, grade,
  processor_brand, processor_model, processor_generation, cpu_cores, cpu_speed,
  ram, ram_type, ram_speed, max_ram, storage_type, storage_capacity,
  display_size, display_resolution, display_type,
  graphics_type, gpu_model, gpu_memory,
  battery_condition, weight, warranty, warranty_period,
  condition_notes, short_description, description,
  availability, is_featured, is_active, show_price,
  seo_title, seo_description
) VALUES
(
  'RCS-DP5560', 'Dell Precision 5560', 'dell-precision-5560',
  (SELECT id FROM public.brands WHERE slug='dell'), (SELECT id FROM public.categories WHERE slug='laptops'),
  'Mobile Workstation','Refurbished','Refurbished A',
  'Intel','Core i9-11950H','11th Gen','8-core','Up to 4.9GHz',
  '64GB','DDR4','3200MHz',NULL,'PCIe NVMe SSD','512GB',
  '15.6 inch','Full HD+ 1920x1200 (UHD+ 3840x2400 touch option)','16:10 aspect ratio',
  'Integrated / dedicated option','Intel UHD Graphics (NVIDIA RTX A2000 option)','4GB GDDR6 (RTX A2000 option)',
  '56Wh or 86Wh lithium-ion, USB-C fast charging','Approximately 1.84 kg','6 month warranty remaining from Dell','6 months',
  'Aluminium and carbon fibre chassis. The display and graphics options listed are configuration options offered for this model - please confirm the exact configuration with us before ordering.',
  'Intel Core i9-11950H, 64GB DDR4, 512GB NVMe SSD, 15.6-inch mobile workstation.',
  'The Dell Precision 5560 is a compact 15.6-inch mobile workstation built around an 8-core Intel Core i9-11950H processor with turbo up to 4.9GHz. It pairs 64GB of DDR4 3200MHz memory with a 512GB PCIe NVMe SSD in an aluminium and carbon fibre chassis weighing approximately 1.84 kg. Display and graphics configurations vary - contact us to confirm the exact configuration currently available.',
  'Enquire for Availability', true, true, false,
  'Dell Precision 5560 Refurbished Mobile Workstation | R Computer Solutions',
  'Refurbished Dell Precision 5560 with Intel Core i9-11950H, 64GB RAM and 512GB NVMe SSD. Quality checked. Contact for price and availability in Navi Mumbai.'
),
(
  'RCS-DL5490', 'Dell Latitude 5490', 'dell-latitude-5490',
  (SELECT id FROM public.brands WHERE slug='dell'), (SELECT id FROM public.categories WHERE slug='laptops'),
  'Business Laptop','Refurbished','Refurbished A',
  'Intel','Core i5-8250U','8th Gen','4-core','Up to 3.4GHz',
  '8GB','DDR4',NULL,'Up to 32GB','SSD','256GB',
  '14 inch','Full HD 1920x1080','Anti-glare',
  'Integrated','Intel UHD Graphics 620',NULL,
  'Excellent condition',NULL,'1 month warranty','1 month',
  NULL,
  'Intel Core i5 8th Gen, 8GB RAM, 256GB SSD, 14-inch Display',
  'The Dell Latitude 5490 is a 14-inch business laptop powered by a 4-core Intel Core i5-8250U (8th Gen) processor with turbo up to 3.4GHz. It ships with 8GB DDR4 memory, upgradeable up to 32GB, a 256GB SSD, a Full HD 1920x1080 anti-glare display and Intel UHD Graphics 620. Battery is in excellent condition.',
  'Enquire for Availability', true, true, false,
  'Dell Latitude 5490 Refurbished Laptop | R Computer Solutions',
  'Refurbished Dell Latitude 5490 with Intel Core i5 8th Gen, 8GB RAM and 256GB SSD. Quality checked business laptop. Contact for price in Navi Mumbai.'
),
(
  'RCS-HPZ840', 'HP Z840 Workstation', 'hp-z840-workstation',
  (SELECT id FROM public.brands WHERE slug='hp'), (SELECT id FROM public.categories WHERE slug='workstations'),
  'Tower Workstation','Refurbished','Refurbished A',
  'Intel','Dual Intel Xeon E5-2698 v4',NULL,'40 cores total (2 processors x 20 cores)',NULL,
  '128GB',NULL,NULL,NULL,'SSD + HDD','256GB SSD + 2TB HDD',
  NULL,NULL,NULL,
  'Dedicated','NVIDIA Quadro K5200',NULL,
  NULL,NULL,'Testing warranty - 1 month','1 month',
  NULL,
  'Dual Intel Xeon E5-2698 v4, 40 cores, 128GB RAM, 256GB SSD + 2TB HDD, NVIDIA Quadro K5200.',
  'The HP Z840 is a dual-processor tower workstation fitted with two Intel Xeon E5-2698 v4 processors providing 40 cores in total, 128GB of memory, a 256GB SSD paired with a 2TB hard drive, and an NVIDIA Quadro K5200 graphics card. Suited to rendering, simulation and heavy multi-threaded workloads.',
  'Enquire for Availability', true, true, false,
  'HP Z840 Refurbished Workstation | R Computer Solutions',
  'Refurbished HP Z840 dual Xeon workstation with 40 cores, 128GB RAM and NVIDIA Quadro K5200. Contact for price and availability in Navi Mumbai.'
);

-- ============ SEED: SERVICES ============
INSERT INTO public.services (title, slug, short_description, description, icon, benefits, sort_order) VALUES
('Laptop Repair','laptop-repair','Diagnostics and repair for all major laptop brands.','Component-level and board-level laptop repair for Dell, HP, Lenovo and other brands, including screen, keyboard, battery, charging and motherboard issues.','Laptop',ARRAY['Initial diagnosis','Component-level repair','All major brands'],1),
('Desktop Repair','desktop-repair','Repair and servicing for desktop computers.','Desktop diagnostics, part replacement, thermal servicing and performance troubleshooting.','Monitor',ARRAY['Hardware diagnostics','Part replacement','Performance tuning'],2),
('Hardware Upgrade','hardware-upgrade','Upgrade existing machines instead of replacing them.','Processor, memory, storage and graphics upgrades to extend the life of existing hardware.','Cpu',ARRAY['Cost-effective','Tested components','Data preserved'],3),
('SSD Upgrade','ssd-upgrade','Move from hard drives to solid state storage.','SSD installation and data migration for faster boot and application load times.','HardDrive',ARRAY['Faster boot times','Data migration','SATA and NVMe'],4),
('RAM Upgrade','ram-upgrade','Increase memory for smoother multitasking.','Memory upgrades with compatibility checks for laptops, desktops and workstations.','MemoryStick',ARRAY['Compatibility checked','Laptop and desktop','Tested after fitting'],5),
('Data & Storage Solutions','data-storage-solutions','Storage planning, backup and recovery support.','Storage configuration, backup setup and data transfer services for individuals and businesses.','Database',ARRAY['Backup setup','Data transfer','Storage planning'],6),
('CCTV Service','cctv-service','CCTV supply, installation and maintenance.','CCTV camera supply, installation, configuration and maintenance for offices and commercial premises.','Camera',ARRAY['Site survey','Installation','Maintenance'],7),
('AMC Service','amc-service','Annual maintenance contracts for business IT.','Annual maintenance contracts covering preventive servicing and priority support for office IT fleets.','ShieldCheck',ARRAY['Preventive servicing','Priority support','Fleet coverage'],8),
('Rental Service','rental-service','Short and long term IT hardware rental.','Laptop, desktop and workstation rental for projects, events, training and temporary teams.','CalendarClock',ARRAY['Short and long term','Bulk quantities','Support included'],9),
('Bulk IT Supply','bulk-it-supply','Volume supply of refurbished IT hardware.','Bulk supply of refurbished laptops, desktops, workstations and monitors for offices and institutions.','Package',ARRAY['Volume pricing','Consistent configurations','GST invoicing'],10),
('Corporate IT Solutions','corporate-it-solutions','End-to-end IT procurement and support for businesses.','Procurement, deployment, maintenance and buy-back support for corporate IT environments.','Building2',ARRAY['Procurement','Deployment','Ongoing support'],11);

-- ============ SEED: FAQS ============
INSERT INTO public.faqs (question, answer, sort_order) VALUES
('Are refurbished laptops tested?','Yes. Every device we supply is inspected and functionally tested before delivery, covering display, keyboard, battery, ports, storage, memory and thermals.',1),
('What warranty do refurbished laptops have?','Warranty varies by product and is listed on each product page. Where a unit carries remaining manufacturer warranty or a testing warranty, the exact period is shown. Contact us if you need details for a specific unit.',2),
('Do you provide bulk orders?','Yes. We supply refurbished laptops, desktops, workstations and monitors in bulk to offices, institutions, resellers and government buyers. Use the Bulk Orders page to send your requirement.',3),
('Do you deliver across India?','Yes, we support delivery across India. Delivery timelines and charges depend on quantity and destination and are confirmed when you enquire.',4),
('Can RAM and SSD be upgraded?','In most models, yes. We can quote memory and storage upgrades along with the device. Tell us your requirement and we will confirm what the specific model supports.',5),
('Do you provide laptop repair?','Yes. We handle laptop and desktop repair, upgrades, CCTV service, AMC and rental. See our Services page for the full list.',6),
('Can I request a specific laptop model?','Yes. If a model is not listed, send us an enquiry with the configuration you need and we will check availability.',7),
('Do you provide GST invoices?','Yes. We are GST registered (27BNDPR2219D1Z8) and provide GST invoices for all purchases.',8);

-- ============ SEED: TESTIMONIALS ============
INSERT INTO public.testimonials (customer_name, company, review, rating, is_featured, sort_order) VALUES
('Rahul S.','Corporate Buyer','Bought refurbished Dell laptops for our office. The machines were clean, tested and delivered on time.',5,true,1),
('Imran K.','Small Business Owner','Good pricing on refurbished desktops and helpful support when we needed an SSD upgrade.',5,true,2),
('Priya M.','Institution','Responsive team and a straightforward process for a bulk requirement.',4,true,3);

-- ============ SEED: SETTINGS ============
INSERT INTO public.settings (key, value, group_name, label) VALUES
('company_name','R Computer Solutions','company','Company name'),
('company_secondary','The IT Hub','company','Secondary name'),
('tagline','Computer Wholesaler','company','Tagline'),
('phone','+91 8691914641','contact','Phone'),
('phone_alt','+91 8691934641','contact','Alternate phone'),
('whatsapp','918691914641','contact','WhatsApp number'),
('email','theithub400709@gmail.com','contact','Email'),
('address','Abhinav Building, 1st Floor, EL 107, Electronic Zone, TTC Industrial Area, Mahape, Navi Mumbai - 400710','contact','Address'),
('gst_number','27BNDPR2219D1Z8','company','GST number'),
('business_hours','Monday to Saturday, 10:00 AM - 8:00 PM','contact','Business hours'),
('maps_embed_url','https://www.google.com/maps?q=Abhinav%20Building%2C%20EL%20107%2C%20Electronic%20Zone%2C%20TTC%20Industrial%20Area%2C%20Mahape%2C%20Navi%20Mumbai%20400710&output=embed','contact','Google Maps embed URL'),
('announcement_text','Refurbished IT Solutions | Bulk Orders | Pan-India Delivery','homepage','Announcement bar text'),
('announcement_enabled','true','homepage','Announcement bar enabled'),
('hero_title','Quality Refurbished Technology. Built for Performance.','homepage','Hero title'),
('hero_subtitle','Premium refurbished laptops, desktops and workstations from trusted brands. Professionally tested, quality checked and backed by reliable support.','homepage','Hero subtitle'),
('hero_cta1_text','Browse Laptops','homepage','Hero CTA 1 text'),
('hero_cta1_link','/products/laptops','homepage','Hero CTA 1 link'),
('hero_cta2_text','Get a Quote','homepage','Hero CTA 2 text'),
('hero_cta2_link','/bulk-orders','homepage','Hero CTA 2 link'),
('hero_image','','homepage','Hero image URL'),
('hero_enabled','true','homepage','Hero section enabled'),
('default_enquiry_message','Hello R Computer Solutions, I am interested in {product}. Please share current price, availability and details.','contact','Default WhatsApp message'),
('default_warranty_text','Warranty varies by product and is listed on each product page. Please confirm warranty details before purchase.','company','Default warranty text'),
('footer_text','R Computer Solutions - The IT Hub is a Navi Mumbai based wholesaler of refurbished laptops, desktops, workstations and IT hardware, serving businesses, institutions and resellers across India.','footer','Footer description'),
('copyright_text','R Computer Solutions. All rights reserved.','footer','Copyright text'),
('social_facebook','','social','Facebook URL'),
('social_instagram','','social','Instagram URL'),
('social_linkedin','','social','LinkedIn URL'),
('social_youtube','','social','YouTube URL'),
('site_title','R Computer Solutions - Refurbished Laptops & IT Hardware, Navi Mumbai','seo','Site title'),
('site_description','Wholesaler of refurbished laptops, desktops, workstations, monitors and IT hardware in Navi Mumbai. Quality tested devices, bulk supply and pan-India delivery.','seo','Site description'),
('site_keywords','refurbished laptops Navi Mumbai, used laptops Mumbai, refurbished workstations, computer wholesaler Navi Mumbai','seo','Site keywords'),
('og_image','','seo','Default social share image'),
('google_verification','','seo','Google site verification'),
('google_analytics_id','','seo','Google Analytics ID'),
('google_tag_manager_id','','seo','Google Tag Manager ID'),
('stat_years','','company','Years in business (blank hides it)'),
('stat_clients','','company','Clients served (blank hides it)'),
('stat_devices','','company','Devices delivered (blank hides it)');

-- ============ SEED: PAGES ============
INSERT INTO public.pages (slug, title, content, seo_title, seo_description) VALUES
('about','About R Computer Solutions', jsonb_build_object(
  'intro','R Computer Solutions - The IT Hub is a Navi Mumbai based computer wholesaler specialising in refurbished laptops, desktops and workstations from trusted brands such as Dell, HP and Lenovo. We serve individual buyers, offices, institutions and resellers with quality checked hardware and practical pricing.',
  'story','The business was built around a simple idea: good business-grade computing should not require a new-machine budget. We source pre-owned and off-lease business hardware, inspect and refurbish it properly, and pass on machines that are genuinely fit for daily work. Alongside sales, we handle repair, upgrades, AMC, rental and CCTV service from our Mahape facility.',
  'mission','To make reliable, professionally tested computing hardware affordable and accessible for businesses and individuals across India.',
  'vision','To be a trusted long-term IT hardware partner for businesses in Navi Mumbai and beyond, known for honest grading, fair pricing and dependable after-sales support.',
  'quality','Every device passes a structured inspection covering display, keyboard, touchpad, battery, charger, ports, wireless, camera, audio, storage health, memory, processor, graphics, thermals, operating system and physical condition before it is listed or dispatched.',
  'infrastructure','Our Mahape facility in the TTC Industrial Area houses inspection, repair, testing and packing operations, along with stock for bulk requirements.',
  'corporate','We supply refurbished IT hardware in volume to corporates, schools and colleges, government buyers, resellers and rental customers, with consistent configurations and GST invoicing.',
  'why', jsonb_build_array(
    jsonb_build_object('title','Honest grading','text','Devices are graded and described as they are, with condition notes where relevant.'),
    jsonb_build_object('title','Tested before dispatch','text','Structured functional testing on every unit before it leaves our facility.'),
    jsonb_build_object('title','Bulk capability','text','Volume supply with consistent configurations for offices and institutions.'),
    jsonb_build_object('title','After-sales support','text','Repair, upgrades and AMC handled in-house.')
  )
), 'About Us | R Computer Solutions - The IT Hub, Navi Mumbai','Learn about R Computer Solutions, a Navi Mumbai wholesaler of refurbished laptops, desktops and workstations with in-house testing, repair and bulk IT supply.'),
('privacy-policy','Privacy Policy', jsonb_build_object('body','We collect only the information you provide through our enquiry and contact forms - such as your name, phone number, email address, company name and requirement details - and use it solely to respond to your enquiry and provide the products or services you ask about.

We do not sell or rent your information to third parties. Information may be shared with delivery partners or service providers only where necessary to fulfil your order.

We retain enquiry records for as long as needed for business and statutory purposes. You may ask us to update or delete your details at any time by contacting us using the details on our Contact page.

This policy may be updated from time to time. Please review it periodically.'),'Privacy Policy | R Computer Solutions','How R Computer Solutions collects, uses and protects information submitted through our website.'),
('terms','Terms & Conditions', jsonb_build_object('body','By using this website you agree to the following terms.

Product listings describe refurbished and pre-owned hardware. Specifications, configurations and availability are indicative and are confirmed at the time of enquiry or order. Where a price is not shown, please contact us for a current quotation.

Orders are confirmed only once we have acknowledged them in writing and received any agreed payment. Prices are subject to change without notice until an order is confirmed.

All product names and brand names are the property of their respective owners and are used for identification purposes only.

These terms are governed by Indian law and subject to the jurisdiction of the courts of Navi Mumbai, Maharashtra.

Business-specific commercial terms such as payment schedules and cancellation charges are agreed per order - please contact us for details.'),'Terms & Conditions | R Computer Solutions','Terms and conditions governing use of the R Computer Solutions website and purchases.'),
('warranty-policy','Warranty Policy', jsonb_build_object('body','Warranty on refurbished hardware varies by product and is stated on each product page. Some units carry remaining manufacturer warranty; others carry a limited testing warranty from us. Where no warranty is stated, please confirm with us before purchase.

What is typically covered: hardware faults arising under normal use during the stated warranty period.

What is typically not covered: physical damage, liquid damage, damage from power surges, unauthorised repair or opening of the device, consumables, software and data loss, and cosmetic wear consistent with a refurbished device.

To make a warranty claim, contact us with your invoice details and a description of the fault using the details on our Contact page. Devices may need to be brought to or shipped to our Mahape facility for inspection.

Specific warranty terms for a given order are confirmed on the invoice.'),'Warranty Policy | R Computer Solutions','Warranty terms for refurbished laptops, desktops and workstations supplied by R Computer Solutions.'),
('shipping-policy','Shipping Policy', jsonb_build_object('body','We deliver across India. Local deliveries in Navi Mumbai and Mumbai can usually be arranged directly; outstation orders are sent through courier or transport partners.

Delivery timelines depend on destination, quantity and stock availability, and are confirmed at the time of order.

Shipping charges depend on weight, quantity and destination, and are quoted with your order.

Please inspect the packaging on delivery and report any visible transit damage to us and to the courier immediately.

For bulk orders, dispatch schedules are agreed in advance.'),'Shipping Policy | R Computer Solutions','Delivery and shipping information for orders from R Computer Solutions, Navi Mumbai.'),
('returns-policy','Return & Replacement Policy', jsonb_build_object('body','Refurbished hardware is sold on an as-described basis. If a device is materially different from its description, or develops a covered hardware fault within the stated warranty period, contact us promptly and we will arrange inspection, repair or replacement as appropriate.

Returns are not accepted for change of mind, for cosmetic wear consistent with a refurbished device, or for physical or liquid damage after delivery.

Any return must be raised with us before the device is sent back, and the device must include the accessories supplied with it.

Specific return terms for bulk and corporate orders are agreed per order.'),'Return & Replacement Policy | R Computer Solutions','Return and replacement terms for refurbished IT hardware from R Computer Solutions.');