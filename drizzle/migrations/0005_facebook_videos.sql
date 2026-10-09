CREATE TABLE public.facebook_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Facebook video',
  facebook_url text NOT NULL UNIQUE,
  caption text,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.facebook_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facebook_videos TO authenticated;
GRANT ALL ON public.facebook_videos TO service_role;
ALTER TABLE public.facebook_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active facebook videos" ON public.facebook_videos FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage facebook videos" ON public.facebook_videos FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER facebook_videos_updated_at BEFORE UPDATE ON public.facebook_videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();