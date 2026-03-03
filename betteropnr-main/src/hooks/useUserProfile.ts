import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFunctionInvoke } from '@/hooks/useAuthedFunctionInvoke';

export const useUserProfile = () => {
  const { user, isLoaded } = useUser();
  const { invoke } = useAuthedFunctionInvoke();
  const [profileText, setProfileText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const hasLoadedProfile = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedText = useRef('');

  // Load profile when user logs in - using edge function to bypass RLS
  useEffect(() => {
    const loadProfile = async () => {
      // If no user after Clerk loads, stop loading
      if (isLoaded && !user) {
        setIsLoading(false);
        return;
      }

      // Wait for user to be loaded
      if (!isLoaded || !user) {
        return;
      }

      // Only load once per session
      if (hasLoadedProfile.current) {
        return;
      }

      try {
        console.log('Loading user profile via edge function for:', user.id);

        const { data, error } = await invoke<{ profileText?: string; success?: boolean }>('user-profile', {
          body: {
            action: 'get',
            userId: user.id,
          },
        });

        if (error) {
          console.error('Error loading profile:', error);
          // Don't show toast - profile might not exist yet
        } else if (data?.profileText) {
          console.log('Profile loaded successfully');
          setProfileText(data.profileText);
          lastSavedText.current = data.profileText;
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
  }, [user, isLoaded, invoke]);

  // Fallback: if loading takes too long, stop anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Profile loading timeout - proceeding without profile');
        setIsLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Save profile with debouncing - using edge function to bypass RLS
  useEffect(() => {
    // Don't save if still loading or no user
    if (!user || !isLoaded || isLoading) {
      return;
    }

    // Don't save if text hasn't changed from last save
    if (profileText === lastSavedText.current) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Saving profile via edge function for:', user.id);

        const { data, error } = await invoke<{ success?: boolean }>('user-profile', {
          body: {
            action: 'save',
            userId: user.id,
            profileText: profileText,
          },
        });

        if (error) {
          console.error('Error saving profile:', error);
          toast({
            title: "Couldn't save profile",
            description: error.message || "Your changes might not be saved. Please try again.",
            variant: "destructive",
          });
        } else if (data?.success) {
          console.log('Profile saved successfully');
          lastSavedText.current = profileText;
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Couldn't save profile",
          description: error instanceof Error ? error.message : "Your changes might not be saved. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [profileText, user, isLoaded, isLoading, toast, invoke]);

  // Reset on user change
  useEffect(() => {
    hasLoadedProfile.current = false;
    lastSavedText.current = '';
    setProfileText('');
    setIsLoading(true);
  }, [user?.id]);

  return {
    profileText,
    setProfileText,
    isLoading,
  };
};
