import { createClient } from "@supabase/supabase-js";

// Vite exposes env vars via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase env vars! Auth will not work.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
