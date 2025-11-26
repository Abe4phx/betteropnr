import { createContext, useContext, useMemo, ReactNode, useEffect, useState } from 'react';
import { useSession } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SupabaseContextType {
  client: SupabaseClient<Database>;
  jwtError: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const [supabaseAccessToken, setSupabaseAccessToken] = useState<string | null>(null);
  const [jwtError, setJwtError] = useState<boolean>(false);

  useEffect(() => {
    const getToken = async () => {
      if (!session) {
        setSupabaseAccessToken(null);
        setJwtError(false);
        return;
      }
      
      try {
        const token = await session.getToken({ template: 'supabase' });
        if (!token) {
          setJwtError(true);
          console.warn('Clerk JWT template "supabase" not configured');
        } else {
          setSupabaseAccessToken(token);
          setJwtError(false);
        }
      } catch (error) {
        console.error('Error getting Clerk token for Supabase:', error);
        setJwtError(true);
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
          storage: localStorage,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }, [supabaseAccessToken]);

  const contextValue = useMemo(() => ({
    client: supabase,
    jwtError
  }), [supabase, jwtError]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {jwtError && session && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
          <Alert variant="destructive" className="shadow-lg border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Action Required: Clerk JWT Template Not Configured</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p className="font-medium">
                Backend features (profile saving, welcome flow, etc.) won't work until you configure the JWT template:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to your Clerk Dashboard</li>
                <li>Navigate to <strong>JWT Templates</strong></li>
                <li>Click <strong>New Template</strong> → Select <strong>Supabase</strong></li>
                <li>Name it <strong>supabase</strong></li>
                <li>Add a claim: <code className="bg-muted px-1 rounded">sub</code> → <code className="bg-muted px-1 rounded">{"{{user.id}}"}</code></li>
                <li>Save the template and refresh this page</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open('https://dashboard.clerk.com', '_blank')}
              >
                Open Clerk Dashboard
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
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
