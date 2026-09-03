import { useEffect, useState } from 'react';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import { supabase } from '@/integrations/supabase/client';
import { useNativeAwareAuth } from '@/hooks/useNativeAwareAuth';

export const useIsNewUser = (isSyncedOverride?: boolean) => {
  const { userId, isLoaded, getAuthToken } = useNativeAwareAuth();
  const { isSynced: contextSynced } = useClerkSyncContext();
  
  // Use override if provided, otherwise use context
  const isSynced = isSyncedOverride !== undefined ? isSyncedOverride : contextSynced;
  
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkIfNewUser = async () => {
      // Wait for user to be loaded AND user to be synced to database
      if (!isLoaded || !userId || !isSynced) {
        return; // Don't set isChecking to false yet - still waiting
      }

      try {
        // Get Clerk session token for auth
        const token = await getAuthToken();
        
        if (!token) {
          console.error('No auth token available for checkNewUser');
          setIsNewUser(false);
          setIsChecking(false);
          return;
        }

        // Use edge function with proper auth
        const { data, error } = await supabase.functions.invoke('user-profile', {
          body: {
            action: 'checkNewUser',
            userId,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (error) {
          console.error('Error checking new user status:', error);
          setIsNewUser(false);
        } else {
          setIsNewUser(data?.isNewUser ?? false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsNewUser(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkIfNewUser();
  }, [userId, isLoaded, isSynced, getAuthToken]);

  return { isNewUser, isChecking };
};
