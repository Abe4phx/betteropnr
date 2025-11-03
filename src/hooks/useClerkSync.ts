import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useClerkSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isLoaded || !user) return;

      try {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_user_id', user.id)
          .single();

        const userData = {
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          username: user.username || user.firstName || 'User',
          plan: existingUser?.plan || 'free',
        };

        if (!existingUser) {
          // Insert new user
          await supabase.from('users').insert(userData);
        } else {
          // Update existing user
          await supabase
            .from('users')
            .update({
              email: userData.email,
              username: userData.username,
            })
            .eq('clerk_user_id', user.id);
        }
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    };

    syncUserToSupabase();
  }, [user, isLoaded]);

  return { user, isLoaded };
};
