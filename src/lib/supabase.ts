
import { createClient } from '@supabase/supabase-js';

// This file is kept for type compatibility but the clients
// are now created on-demand inside server actions in actions.ts
// to ensure environment variables are loaded correctly.

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
  : null;
