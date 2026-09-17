CREATE TABLE public.whatsapp_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_text text NOT NULL,
  source text,
  status text NOT NULL DEFAULT 'pending',
  products_created integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX whatsapp_inbox_created_at_idx ON public.whatsapp_inbox (created_at DESC);

GRANT SELECT, DELETE ON public.whatsapp_inbox TO authenticated;
GRANT ALL ON public.whatsapp_inbox TO service_role;

ALTER TABLE public.whatsapp_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read whatsapp inbox"
ON public.whatsapp_inbox FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete whatsapp inbox"
ON public.whatsapp_inbox FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));