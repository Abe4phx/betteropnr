import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

interface InvokeOptions {
  body?: Record<string, unknown>;
}

interface InvokeResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Hook that provides an authenticated function invocation helper.
 * Automatically fetches the Clerk session token and passes it as Authorization header.
 */
export const useAuthedFunctionInvoke = () => {
  const { getToken } = useAuth();

  const invoke = useCallback(async <T = unknown>(
    functionName: string,
    options: InvokeOptions = {}
  ): Promise<InvokeResult<T>> => {
    try {
      const token = await getToken();
      
      if (!token) {
        console.error(`No auth token available for ${functionName}`);
        return {
          data: null,
          error: new Error('Not authenticated - no session token available'),
        };
      }

      const { data, error } = await supabase.functions.invoke<T>(functionName, {
        body: options.body,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error(`Error invoking ${functionName}:`, err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }, [getToken]);

  /**
   * Get token for manual usage (e.g., for raw fetch calls that can't use invoke)
   */
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    return await getToken();
  }, [getToken]);

  return { invoke, getAuthToken };
};
