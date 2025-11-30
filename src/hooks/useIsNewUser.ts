import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';

export const useIsNewUser = (isSyncedOverride?: boolean) => {
  const { user, isLoaded } = useUser();
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
        // Use edge function to bypass RLS issues
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-profile`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'checkNewUser',
              userId: user.id,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsNewUser(data.isNewUser);
        } else {
          console.error('Error checking new user status');
          setIsNewUser(false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsNewUser(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkIfNewUser();
  }, [user, isLoaded, isSynced]);

  return { isNewUser, isChecking };
};
