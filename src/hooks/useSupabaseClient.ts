import { useSession } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const useSupabaseClient = () => {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: session
            ? {
                Authorization: `Bearer ${session.lastActiveToken?.getRawString() || ''}`,
              }
            : {},
        },
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }, [session]);

  return supabase;
};
