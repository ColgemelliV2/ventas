
import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;
let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
    if (supabaseClient) {
        return supabaseClient;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key are required. Check your .env.local file.');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
}

function getSupabaseAdminClient() {
    if (supabaseAdminClient) {
        return supabaseAdminClient;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !serviceKey) {
        console.warn("Supabase Service Key or URL not found. Admin actions will fail.");
        return null;
    }
    supabaseAdminClient = createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    return supabaseAdminClient;
}

export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();
