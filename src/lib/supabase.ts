import { createClient } from '@supabase/supabase-js';

// Ensure the variables are read correctly in different environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Make sure they are set in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
