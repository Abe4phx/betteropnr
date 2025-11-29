import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseContext } from '@/contexts/SupabaseContext';

export const useIsNewUser = () => {
  const { user, isLoaded } = useUser();
  const { client: supabase, isTokenReady } = useSupabaseContext();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkIfNewUser = async () => {
      // Wait for user to be loaded AND token to be ready
      if (!isLoaded || !user || !isTokenReady) {
        return; // Don't set isChecking to false yet - still waiting
      }

      try {
        // Check if user has seen the welcome flow before
        const { data: userData } = await supabase
          .from('users')
          .select('has_seen_welcome')
          .eq('clerk_user_id', user.id)
          .maybeSingle();

        // User is "new" if they haven't seen the welcome flow yet
        const isNew = !userData || !userData.has_seen_welcome;
        
        setIsNewUser(isNew);
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsNewUser(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkIfNewUser();
  }, [user, isLoaded, isTokenReady, supabase]);

  return { isNewUser, isChecking };
};
