-- ═══════════════════════════════════════════════════════════════
-- Tu Gusto store schema for Supabase
-- ═══════════════════════════════════════════════════════════════

-- ── Products ──
CREATE TABLE IF NOT EXISTS public.products (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "name_ar" text NOT NULL DEFAULT '',
  "slug" text NOT NULL UNIQUE,
  "description" text NOT NULL DEFAULT '',
  "description_ar" text NOT NULL DEFAULT '',
  "price" numeric(10,2) NOT NULL,
  "originalPrice" numeric(10,2),
  "category" text NOT NULL,
  "imageUrl" text NOT NULL,
  "images" text[] NOT NULL DEFAULT '{}',
  "stock" integer NOT NULL DEFAULT 0,
  "views" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS "name_ar" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "description_ar" text NOT NULL DEFAULT '';

-- ── Reviews ──
CREATE TABLE IF NOT EXISTS public.reviews (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" uuid NOT NULL REFERENCES public.products("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "rating" integer NOT NULL,
  "text" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- ── Orders ──
CREATE TABLE IF NOT EXISTS public.orders (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerName" text NOT NULL,
  "customerEmail" text,
  "phone" text NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "bostaTrackingId" text,
  "bostaDeliveryId" text,
  "bostaStatus" text,
  "deliveryFee" numeric(10,2) NOT NULL DEFAULT 0,
  "discountCode" text,
  "discountLabel" text,
  "discountAmount" numeric(10,2) NOT NULL DEFAULT 0,
  "totalAmount" numeric(10,2) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- ── Order items ──
CREATE TABLE IF NOT EXISTS public.order_items (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" uuid NOT NULL REFERENCES public.orders("id") ON DELETE RESTRICT,
  "productId" uuid NOT NULL REFERENCES public.products("id") ON DELETE RESTRICT,
  "quantity" integer NOT NULL,
  "priceAtPurchase" numeric(10,2) NOT NULL
);

-- ── Push subscriptions ──
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "endpoint" text NOT NULL UNIQUE,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- ── Wheel prizes ──
CREATE TABLE IF NOT EXISTS public.wheel_prizes (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "label" text NOT NULL,
  "label_ar" text NOT NULL DEFAULT '',
  "code" text NOT NULL UNIQUE,
  "color" text NOT NULL DEFAULT '#C0392B',
  "weight" integer NOT NULL DEFAULT 1,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wheel_prizes
  ADD COLUMN IF NOT EXISTS "label_ar" text NOT NULL DEFAULT '';

-- Re-running the migration must not create duplicate prizes: dedupe rows that
-- share a code (keeping the earliest inserted) and then enforce uniqueness.
DELETE FROM public.wheel_prizes a
USING public.wheel_prizes b
WHERE a."code" = b."code" AND a.ctid > b.ctid;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'wheel_prizes_code_key'
  ) THEN
    ALTER TABLE public.wheel_prizes
      ADD CONSTRAINT wheel_prizes_code_key UNIQUE ("code");
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Product image storage (Supabase Storage bucket)
-- The app uploads product images here (not to local disk). The bucket is
-- PUBLIC so the storefront can display images without any auth token.
-- ═══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'product-images-public-read'
  ) THEN
    CREATE POLICY "product-images-public-read"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'product-images-anon-insert'
  ) THEN
    CREATE POLICY "product-images-anon-insert"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- ── Settings (key/value store, e.g. admin email) ──
CREATE TABLE IF NOT EXISTS public.settings (
  "key" text PRIMARY KEY,
  "value" text
);

-- ── Grants (safety net; Supabase usually grants these by default) ──
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON public.settings TO anon, authenticated;

-- ── Row Level Security ──
-- The app talks to Supabase ONLY through the anon/publishable key (there are
-- no Supabase Auth users). RLS must be OFF or every read silently returns
-- nothing and every write fails with "violates row-level security policy".
-- Run this once, or re-run the migration, and the store reads/writes its data.
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_prizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
