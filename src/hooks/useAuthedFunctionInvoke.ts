import { supabase } from '@/integrations/supabase/client';
import { FunctionsError } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { useNativeAwareAuth } from '@/hooks/useNativeAwareAuth';

interface InvokeOptions {
  body?: Record<string, unknown>;
}

interface InvokeResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Hook that provides an authenticated function invocation helper.
 * Automatically fetches the active auth token and passes it as Authorization header.
 */
export const useAuthedFunctionInvoke = () => {
  const {
    getAuthToken: getNativeAwareAuthToken,
    isNativeAuthenticated,
  } = useNativeAwareAuth();

  const invoke = useCallback(async <T = unknown>(
    functionName: string,
    options: InvokeOptions = {}
  ): Promise<InvokeResult<T>> => {
    try {
      const token = await getNativeAwareAuthToken();
      const isUserProfileDiagnostic = functionName === 'user-profile';
      if (isUserProfileDiagnostic) {
        console.log('[user-profile invoke diagnostic]', {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          functionName,
          hasAuthorization: Boolean(token),
          tokenPreview: token ? token.slice(0, 25) : null,
          usesNativeTokenPath: isNativeAuthenticated,
        });
      }
      
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
        if (isUserProfileDiagnostic) {
          console.error('[user-profile invoke error diagnostic]', {
            name: error.name,
            message: error.message,
            context: error instanceof FunctionsError ? error.context : undefined,
            json: JSON.stringify(error),
          });
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error(`Error invoking ${functionName}:`, err);
      if (functionName === 'user-profile') {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('[user-profile invoke catch diagnostic]', {
          name: error.name,
          message: error.message,
          context: error instanceof FunctionsError ? error.context : undefined,
          json: JSON.stringify(error),
        });
      }
      return {
        data: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }, [getNativeAwareAuthToken, isNativeAuthenticated]);

  /**
   * Get token for manual usage (e.g., for raw fetch calls that can't use invoke)
   */
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    return await getNativeAwareAuthToken();
  }, [getNativeAwareAuthToken]);

  return { invoke, getAuthToken };
};
