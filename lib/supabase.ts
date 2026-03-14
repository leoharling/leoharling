import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Photo {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  category: "aerial" | "adventure" | "travel" | "other";
  taken_at: string | null;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface ConflictTerritory {
  id: string;
  conflict_id: string;
  date: string;
  label: string;
  geojson: object;
  created_at: string;
}

export interface UCDPEvent {
  id: number;
  conflict_id: string;
  year: number;
  type_of_violence: number;
  conflict_name: string | null;
  dyad_name: string | null;
  side_a: string | null;
  side_b: string | null;
  latitude: number;
  longitude: number;
  date_start: string | null;
  date_end: string | null;
  best: number;
  high: number;
  low: number;
  deaths_civilians: number;
  number_of_sources: number;
  source_headline: string | null;
  where_description: string | null;
  country: string | null;
  region: string | null;
  created_at: string;
}
