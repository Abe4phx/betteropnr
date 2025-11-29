import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseContext } from '@/contexts/SupabaseContext';
import { useToast } from '@/hooks/use-toast';

export const useUserProfile = () => {
  const { user, isLoaded } = useUser();
  const { client: supabase, isTokenReady } = useSupabaseContext();
  const [profileText, setProfileText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load profile when user logs in
  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded || !user || !isTokenReady) {
        if (isLoaded && !user) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('profile_text')
          .eq('clerk_user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.profile_text) {
          setProfileText(data.profile_text);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Couldn't load profile",
          description: "Your profile will start fresh this session.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, isLoaded, isTokenReady, toast, supabase]);

  // Save profile with debouncing
  useEffect(() => {
    if (!user || !isLoaded || isLoading || !isTokenReady) return;

    const timeoutId = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert(
            {
              clerk_user_id: user.id,
              profile_text: profileText,
            },
            {
              onConflict: 'clerk_user_id',
            }
          );

        if (error) throw error;
      } catch (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Couldn't save profile",
          description: "Your changes might not be saved.",
          variant: "destructive",
        });
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [profileText, user, isLoaded, isLoading, isTokenReady, toast, supabase]);

  return {
    profileText,
    setProfileText,
    isLoading,
  };
};
