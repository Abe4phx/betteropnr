import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseContext } from '@/contexts/SupabaseContext';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import { useToast } from '@/hooks/use-toast';

export const useUserProfile = () => {
  const { user, isLoaded } = useUser();
  const { client: supabase, isTokenReady } = useSupabaseContext();
  const { isSynced } = useClerkSyncContext();
  const [profileText, setProfileText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const hasLoadedProfile = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load profile when user logs in
  useEffect(() => {
    const loadProfile = async () => {
      // If no user after Clerk loads, stop loading
      if (isLoaded && !user) {
        setIsLoading(false);
        return;
      }

      // Wait for all conditions to be met
      if (!isLoaded || !user || !isTokenReady || !isSynced) {
        return;
      }

      // Only load once per session
      if (hasLoadedProfile.current) {
        return;
      }

      try {
        console.log('Loading user profile for:', user.id);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('profile_text')
          .eq('clerk_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading profile:', error);
          // Don't show toast for first load - profile might not exist yet
          // Just mark as loaded so the user can save
        } else if (data?.profile_text) {
          console.log('Profile loaded successfully');
          setProfileText(data.profile_text);
        } else {
          console.log('No existing profile found');
        }
        
        hasLoadedProfile.current = true;
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, isLoaded, isTokenReady, isSynced, supabase]);

  // Fallback: if loading takes too long, stop anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Profile loading timeout - proceeding without profile');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Save profile with debouncing
  useEffect(() => {
    // Don't save if still loading or conditions not met
    if (!user || !isLoaded || isLoading || !isTokenReady || !isSynced) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Saving profile for:', user.id);
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

        if (error) {
          console.error('Error saving profile:', error);
          toast({
            title: "Couldn't save profile",
            description: "Your changes might not be saved. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log('Profile saved successfully');
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Couldn't save profile",
          description: "Your changes might not be saved. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500); // Debounce for 1.5 seconds

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [profileText, user, isLoaded, isLoading, isTokenReady, isSynced, toast, supabase]);

  // Reset on user change
  useEffect(() => {
    hasLoadedProfile.current = false;
    setProfileText('');
    setIsLoading(true);
  }, [user?.id]);

  return {
    profileText,
    setProfileText,
    isLoading,
  };
};
