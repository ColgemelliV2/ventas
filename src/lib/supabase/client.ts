import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// NOTE: THIS FILE IS NOT USED. The client is created directly in actions.ts
// to ensure server-side environment variables are used correctly.
// This is kept for reference or future client-side needs.
// For all server-side operations, see `getSupabaseClient` in `src/app/actions.ts`.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);
