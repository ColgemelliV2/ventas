import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Note: `dotenv` is not needed. Next.js automatically loads `.env.local`
// variables into `process.env` on the server-side.
// This function will be used to create a Supabase client in our server actions.
export const createClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};
