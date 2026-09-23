CREATE TABLE public.instagram_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  instagram_url TEXT NOT NULL UNIQUE,
  caption TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT instagram_videos_url_check CHECK (instagram_url ~ '^https://(www\.)?instagram\.com/(reel|reels|p|tv)/')
);

GRANT SELECT ON public.instagram_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_videos TO authenticated;
GRANT ALL ON public.instagram_videos TO service_role;

ALTER TABLE public.instagram_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active Instagram videos"
ON public.instagram_videos
FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert Instagram videos"
ON public.instagram_videos
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update Instagram videos"
ON public.instagram_videos
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete Instagram videos"
ON public.instagram_videos
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX instagram_videos_public_order_idx
ON public.instagram_videos (is_active, sort_order, published_at DESC, created_at DESC);