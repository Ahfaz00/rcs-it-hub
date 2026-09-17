ALTER TABLE public.whatsapp_inbox
  ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS product_ids jsonb NOT NULL DEFAULT '[]'::jsonb;