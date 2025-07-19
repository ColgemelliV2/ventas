import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This function creates a Supabase client.
// It is intended to be used in Server Actions and other server-side code.
// It reads the Supabase URL and Anon Key from environment variables.
export const createClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // In a real app, you'd want more robust error handling or logging.
    // For this example, we'll throw an error if the variables are not set.
    throw new Error('Supabase URL and/or Anon Key are not set in environment variables.');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};
