import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseContext } from '@/contexts/SupabaseContext';

export const useClerkSync = () => {
  const { user, isLoaded } = useUser();
  const { client: supabase, isTokenReady } = useSupabaseContext();

  useEffect(() => {
    const syncUserToSupabase = async () => {
      // Wait for both user to be loaded AND token to be ready
      if (!isLoaded || !user || !isTokenReady) return;

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
            console.error('Error creating user:', insertError);
          } else {
            console.log('User created successfully');
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
          }
        }
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    };

    syncUserToSupabase();
  }, [user, isLoaded, isTokenReady, supabase]);

  return { user, isLoaded };
};
