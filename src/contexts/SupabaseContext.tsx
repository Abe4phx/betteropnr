import { createContext, useContext, useMemo, ReactNode } from 'react';
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

  const supabase = useMemo(() => {
    return createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        accessToken: async () => {
          if (!session) return null;
          try {
            // Use getToken without template - works with third-party auth
            const token = await session.getToken();
            return token;
          } catch (error) {
            console.error('Error getting Clerk token:', error);
            return null;
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }, [session]);

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
