-- ============================================
-- Supabase Schema for Leo Harling Personal Website
-- Run this in the Supabase SQL Editor
-- ============================================

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  location_name TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('aerial', 'adventure', 'travel', 'other')),
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Photos: public read access
CREATE POLICY "Public can read photos"
  ON photos FOR SELECT
  TO anon
  USING (true);

-- Contact submissions: public insert only
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Contact submissions: only authenticated users can read
CREATE POLICY "Only authenticated users can read contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Historical conflict territory snapshots
CREATE TABLE IF NOT EXISTS conflict_territories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conflict_id TEXT NOT NULL,
  date DATE NOT NULL,
  label TEXT NOT NULL,
  geojson JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conflict_id, date)
);

ALTER TABLE conflict_territories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read territories"
  ON conflict_territories FOR SELECT
  TO anon
  USING (true);

CREATE INDEX idx_territories_conflict_date ON conflict_territories (conflict_id, date);

-- Launch cache (synced via /api/cron/sync-launches)
CREATE TABLE IF NOT EXISTS launch_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for photos (run separately in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage policy: public read access on photos bucket
-- CREATE POLICY "Public can view photos"
--   ON storage.objects FOR SELECT
--   TO anon
--   USING (bucket_id = 'photos');

-- UCDP Georeferenced Events (cached from UCDP API)
CREATE TABLE ucdp_events (
  id INTEGER PRIMARY KEY,
  conflict_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  type_of_violence INTEGER NOT NULL,
  conflict_name TEXT,
  dyad_name TEXT,
  side_a TEXT,
  side_b TEXT,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  date_start DATE,
  date_end DATE,
  best INTEGER DEFAULT 0,
  high INTEGER DEFAULT 0,
  low INTEGER DEFAULT 0,
  deaths_civilians INTEGER DEFAULT 0,
  number_of_sources INTEGER DEFAULT 0,
  source_headline TEXT,
  where_description TEXT,
  country TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ucdp_events_conflict ON ucdp_events(conflict_id);
CREATE INDEX idx_ucdp_events_date ON ucdp_events(date_end);
CREATE INDEX idx_ucdp_events_best ON ucdp_events(best DESC);

ALTER TABLE ucdp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON ucdp_events FOR SELECT USING (true);
CREATE POLICY "Service can insert ucdp_events" ON ucdp_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update ucdp_events" ON ucdp_events FOR UPDATE USING (true) WITH CHECK (true);
