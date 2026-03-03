import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

interface ClerkSyncContextType {
  isSynced: boolean;
  user: ReturnType<typeof useUser>['user'];
  isLoaded: boolean;
}

const ClerkSyncContext = createContext<ClerkSyncContextType | null>(null);

export const ClerkSyncProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const hasAttemptedSync = useRef(false);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isLoaded || !user) return;

      // Only attempt sync once per session
      if (hasAttemptedSync.current) return;

      try {
        console.log('Syncing user to Supabase via edge function:', user.id);
        hasAttemptedSync.current = true;
        
        const token = await getToken();
        if (!token) {
          console.error('No auth token available for sync');
          setIsSynced(true); // Mark as synced to prevent hanging
          return;
        }

        const { data, error } = await supabase.functions.invoke('user-profile', {
          body: {
            action: 'sync',
            username: user.username || user.firstName || 'User',
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (error) {
          console.error('Error syncing user:', error);
        } else {
          console.log('User sync result:', data);
        }

        setIsSynced(true);
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
        setIsSynced(true); // Mark as synced even on error to prevent hanging
      }
    };

    syncUserToSupabase();
  }, [user, isLoaded, getToken]);

  // Reset sync flag when user changes
  useEffect(() => {
    hasAttemptedSync.current = false;
    setIsSynced(false);
  }, [user?.id]);

  return (
    <ClerkSyncContext.Provider value={{ isSynced, user: user ?? null, isLoaded }}>
      {children}
    </ClerkSyncContext.Provider>
  );
};

export const useClerkSyncContext = () => {
  const context = useContext(ClerkSyncContext);
  if (!context) {
    throw new Error('useClerkSyncContext must be used within ClerkSyncProvider');
  }
  return context;
};
