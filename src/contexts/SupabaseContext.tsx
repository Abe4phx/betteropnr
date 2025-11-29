import { createContext, useContext, useMemo, ReactNode, useEffect, useState } from 'react';
import { useSession } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SupabaseContextType {
  client: SupabaseClient<Database>;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const [supabaseAccessToken, setSupabaseAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (!session) {
        setSupabaseAccessToken(null);
        return;
      }
      
      try {
        const token = await session.getToken({ template: 'supabase' });
        setSupabaseAccessToken(token);
      } catch (error) {
        console.error('Error getting Clerk token for Supabase:', error);
        setSupabaseAccessToken(null);
      }
    };

    getToken();
  }, [session]);

  const supabase = useMemo(() => {
    return createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: supabaseAccessToken
            ? { Authorization: `Bearer ${supabaseAccessToken}` }
            : {},
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }, [supabaseAccessToken]);

  const contextValue = useMemo(() => ({
    client: supabase,
  }), [supabase]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context.client;
};

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within SupabaseProvider');
  }
  return context;
};
