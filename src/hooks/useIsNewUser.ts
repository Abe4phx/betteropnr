import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import { supabase } from '@/integrations/supabase/client';

export const useIsNewUser = (isSyncedOverride?: boolean) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { isSynced: contextSynced } = useClerkSyncContext();
  
  // Use override if provided, otherwise use context
  const isSynced = isSyncedOverride !== undefined ? isSyncedOverride : contextSynced;
  
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkIfNewUser = async () => {
      // Wait for user to be loaded AND user to be synced to database
      if (!isLoaded || !user || !isSynced) {
        return; // Don't set isChecking to false yet - still waiting
      }

      try {
        // Get Clerk session token for auth
        const token = await getToken();
        
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
            userId: user.id,
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
  }, [user, isLoaded, isSynced, getToken]);

  return { isNewUser, isChecking };
};
