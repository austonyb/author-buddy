import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createServiceRoleClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Make sure to add this to your .env.local
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
