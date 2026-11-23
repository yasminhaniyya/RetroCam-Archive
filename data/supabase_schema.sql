-- ========================================================
-- RETROCAM ARCHIVE: SKEMA DATABASE SUPABASE (POSTGRESQL)
-- Jalankan query ini di SQL Editor pada dashboard Supabase
-- ========================================================

-- 1. Tabel Katalog Kamera (55 Kamera)
CREATE TABLE IF NOT EXISTS public.cameras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  "releaseYear" INT,
  "sensorType" TEXT,
  "sensorSize" TEXT,
  megapixels NUMERIC,
  "maxResolution" TEXT,
  lens TEXT,
  zoom TEXT,
  "isoRange" TEXT,
  "shutterSpeed" TEXT,
  screen TEXT,
  "storageType" TEXT,
  battery TEXT,
  weight TEXT,
  "estimatedPriceIdr" TEXT,
  tag TEXT,
  rating NUMERIC,
  "imageUrl" TEXT,
  summary TEXT,
  description TEXT,
  "colorProfile" TEXT,
  pros JSONB,
  cons JSONB,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Katalog Lensa (52 Lensa)
CREATE TABLE IF NOT EXISTS public.lenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  "releaseYear" INT,
  mount TEXT,
  category TEXT,
  "focalLength" TEXT,
  "maxAperture" TEXT,
  "minAperture" TEXT,
  "apertureBlades" INT,
  "opticalDesign" TEXT,
  "filterSize" TEXT,
  weight TEXT,
  "minFocusDistance" TEXT,
  "estimatedPriceIdr" TEXT,
  tag TEXT,
  rating NUMERIC,
  "imageUrl" TEXT,
  summary TEXT,
  description TEXT,
  "bokehCharacter" TEXT,
  pros JSONB,
  cons JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS) Policies agar dapat diakses oleh API
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lenses ENABLE ROW LEVEL SECURITY;

-- Policy untuk cameras
DROP POLICY IF EXISTS "Allow public read cameras" ON public.cameras;
DROP POLICY IF EXISTS "Allow public insert cameras" ON public.cameras;
DROP POLICY IF EXISTS "Allow public update cameras" ON public.cameras;
DROP POLICY IF EXISTS "Allow public delete cameras" ON public.cameras;

CREATE POLICY "Allow public read cameras" ON public.cameras FOR SELECT USING (true);
CREATE POLICY "Allow public insert cameras" ON public.cameras FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update cameras" ON public.cameras FOR UPDATE USING (true);
CREATE POLICY "Allow public delete cameras" ON public.cameras FOR DELETE USING (true);

-- Policy untuk lenses
DROP POLICY IF EXISTS "Allow public read lenses" ON public.lenses;
DROP POLICY IF EXISTS "Allow public insert lenses" ON public.lenses;
DROP POLICY IF EXISTS "Allow public update lenses" ON public.lenses;
DROP POLICY IF EXISTS "Allow public delete lenses" ON public.lenses;

CREATE POLICY "Allow public read lenses" ON public.lenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert lenses" ON public.lenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update lenses" ON public.lenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete lenses" ON public.lenses FOR DELETE USING (true);
