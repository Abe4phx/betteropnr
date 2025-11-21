import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useIsNewUser = () => {
  const { user, isLoaded } = useUser();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkIfNewUser = async () => {
      if (!isLoaded || !user) {
        setIsChecking(false);
        return;
      }

      try {
        // Check if user has generated any openers or saved any favorites
        const { data: usageData } = await supabase
          .from('user_usage')
          .select('openers_generated, favorites_count')
          .eq('user_id', user.id)
          .maybeSingle();

        // User is "new" if they haven't generated any openers yet
        const isNew = !usageData || usageData.openers_generated === 0;
        
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
