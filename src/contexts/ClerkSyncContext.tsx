import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseContext } from '@/contexts/SupabaseContext';

interface ClerkSyncContextType {
  isSynced: boolean;
  user: ReturnType<typeof useUser>['user'];
  isLoaded: boolean;
}

const ClerkSyncContext = createContext<ClerkSyncContextType | null>(null);

export const ClerkSyncProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { client: supabase, isTokenReady } = useSupabaseContext();
  const hasAttemptedSync = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const syncUserToSupabase = async () => {
      // Wait for both user to be loaded AND token to be ready
      if (!isLoaded || !user || !isTokenReady) return;

      // Only attempt sync once per session (unless retrying due to error)
      if (hasAttemptedSync.current && retryCount.current === 0) return;

      try {
        console.log('Syncing user to Supabase:', user.id);
        
        // Check if user exists using maybeSingle to avoid errors when not found
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error checking for existing user:', fetchError);
          return;
        }

        const userData = {
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          username: user.username || user.firstName || 'User',
          plan: existingUser?.plan || 'free',
        };

        if (!existingUser) {
          // Insert new user
          console.log('Creating new user in database');
          const { error: insertError } = await supabase
            .from('users')
            .insert(userData);
          
          if (insertError) {
            // If RLS error, retry after a short delay (token might not be fully propagated)
            if (insertError.message?.includes('row-level security') && retryCount.current < maxRetries) {
              console.log(`RLS error on insert, retrying... (attempt ${retryCount.current + 1}/${maxRetries})`);
              retryCount.current += 1;
              setTimeout(syncUserToSupabase, 500 * retryCount.current);
              return;
            }
            console.error('Error creating user:', insertError);
          } else {
            console.log('User created successfully');
            hasAttemptedSync.current = true;
            retryCount.current = 0;
            setIsSynced(true);
          }
        } else {
          // Update existing user
          console.log('Updating existing user');
          const { error: updateError } = await supabase
            .from('users')
            .update({
              email: userData.email,
              username: userData.username,
            })
            .eq('clerk_user_id', user.id);
          
          if (updateError) {
            console.error('Error updating user:', updateError);
          } else {
            hasAttemptedSync.current = true;
            retryCount.current = 0;
            setIsSynced(true);
          }
        }
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    };

    syncUserToSupabase();
  }, [user, isLoaded, isTokenReady, supabase]);

  // Reset sync flag when user changes
  useEffect(() => {
    hasAttemptedSync.current = false;
    retryCount.current = 0;
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
