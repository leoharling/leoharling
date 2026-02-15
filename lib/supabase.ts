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
