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

-- Create storage bucket for photos (run separately in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage policy: public read access on photos bucket
-- CREATE POLICY "Public can view photos"
--   ON storage.objects FOR SELECT
--   TO anon
--   USING (bucket_id = 'photos');
