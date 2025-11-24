import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from '@/contexts/SupabaseContext';

export const useIsNewUser = () => {
  const { user, isLoaded } = useUser();
  const supabase = useSupabase();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkIfNewUser = async () => {
      if (!isLoaded || !user) {
        setIsChecking(false);
        return;
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
  }, [user, isLoaded]);

  return { isNewUser, isChecking };
};
