import { createContext, useContext, useMemo, ReactNode, useEffect, useState } from 'react';
import { useSession } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const [supabaseAccessToken, setSupabaseAccessToken] = useState<string | null>(null);
  const [jwtError, setJwtError] = useState<boolean>(false);
  const { toast } = useToast();

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
          toast({
            title: "Clerk JWT Template Not Configured",
            description: "The 'supabase' JWT template is missing. Please configure it in your Clerk Dashboard.",
            variant: "destructive",
          });
        } else {
          setSupabaseAccessToken(token);
          setJwtError(false);
        }
      } catch (error) {
        console.error('Error getting Clerk token for Supabase:', error);
        setJwtError(true);
        toast({
          title: "Clerk JWT Template Error",
          description: "Failed to get authentication token. Please ensure the 'supabase' JWT template is configured in Clerk Dashboard.",
          variant: "destructive",
        });
        setSupabaseAccessToken(null);
      }
    };

    getToken();
  }, [session, toast]);

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

  return (
    <SupabaseContext.Provider value={supabase}>
      {jwtError && session && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
          <Alert variant="destructive" className="shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Clerk JWT Template Not Configured</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                To enable profile saving and other backend features, you need to configure a JWT template in your Clerk Dashboard:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to your Clerk Dashboard</li>
                <li>Navigate to <strong>JWT Templates</strong></li>
                <li>Click <strong>New Template</strong> → Select <strong>Supabase</strong></li>
                <li>Name it <strong>supabase</strong></li>
                <li>Add a claim: <code className="bg-muted px-1 rounded">sub</code> → <code className="bg-muted px-1 rounded">{"{{user.id}}"}</code></li>
                <li>Save the template</li>
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
  return context;
};
