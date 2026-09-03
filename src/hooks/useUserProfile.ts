import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFunctionInvoke } from '@/hooks/useAuthedFunctionInvoke';
import { useNativeAwareAuth } from '@/hooks/useNativeAwareAuth';

export const useUserProfile = () => {
  const { userId, isLoaded } = useNativeAwareAuth();
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
      if (isLoaded && !userId) {
        setIsLoading(false);
        return;
      }

      // Wait for user to be loaded
      if (!isLoaded || !userId) {
        return;
      }

      // Only load once per session
      if (hasLoadedProfile.current) {
        return;
      }

      try {
        console.log('Loading user profile via edge function for:', userId);

        const { data, error } = await invoke<{ profileText?: string; success?: boolean }>('user-profile', {
          body: {
            action: 'get',
            userId,
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
  }, [userId, isLoaded, invoke]);

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
    if (!userId || !isLoaded || isLoading) {
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
        console.log('Saving profile via edge function for:', userId);

        const { data, error } = await invoke<{ success?: boolean }>('user-profile', {
          body: {
            action: 'save',
            userId,
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
  }, [profileText, userId, isLoaded, isLoading, toast, invoke]);

  // Reset on user change
  useEffect(() => {
    hasLoadedProfile.current = false;
    lastSavedText.current = '';
    setProfileText('');
    setIsLoading(true);
  }, [userId]);

  return {
    profileText,
    setProfileText,
    isLoading,
  };
};
