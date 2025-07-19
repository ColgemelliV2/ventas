import { createClient } from '@supabase/supabase-js';

// --- Cliente público para el lado del cliente (Navegador) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required for the public client.');
}

// Cliente para uso general en la app, sujeto a RLS.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- Cliente de servicio para el lado del servidor (Acciones de Admin) ---
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Cliente que bypassa RLS, para usar en acciones de servidor seguras.
// Solo se inicializa si la service key está presente.
const createSupabaseAdminClient = () => {
    if (!supabaseServiceKey) {
        console.warn("SUPABASE_SERVICE_KEY is not set. Admin actions will fail. This is expected in some environments.");
        return null;
    }
    if (!supabaseUrl) {
        console.error("Supabase URL is missing for the admin client.");
        return null;
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

export const supabaseAdmin = createSupabaseAdminClient();
