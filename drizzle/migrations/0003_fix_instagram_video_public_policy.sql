DROP POLICY "Public can view active Instagram videos" ON public.instagram_videos;

CREATE POLICY "Anyone can view active Instagram videos"
ON public.instagram_videos
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can view all Instagram videos"
ON public.instagram_videos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));