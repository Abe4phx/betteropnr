import { useEffect, useState } from 'react';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import { supabase } from '@/integrations/supabase/client';
import { useNativeAwareAuth } from '@/hooks/useNativeAwareAuth';

export const useUserPlan = () => {
  const { userId, getAuthToken } = useNativeAwareAuth();
  const { isSynced, isNativeSubscribed, planSyncVersion } = useClerkSyncContext();
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      // Wait for user AND sync to be ready
      if (!userId || !isSynced) {
        return;
      }

      try {
        const token = await getAuthToken();
        if (!token) {
          console.error('No auth token available for getPlan');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('user-profile', {
          body: { action: 'getPlan' },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (error) {
          console.error('Error fetching user plan:', error);
        } else if (data?.plan) {
          setPlan(data.plan);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
    // planSyncVersion: bumped by ClerkSyncContext after any successful
    // sync-apple-subscription call, so every mounted instance of this hook
    // re-fetches the backend plan without an app restart.
  }, [userId, isSynced, getAuthToken, planSyncVersion]);

  // STOREKIT_STARTUP_CHECK: A verified native StoreKit subscription unlocks
  // premium UI immediately, without waiting on (or requiring) a backend
  // plan value. Never downgrades a plan the backend already reports as paid.
  const effectivePlan = isNativeSubscribed && plan === 'free' ? 'pro' : plan;

  return { plan: effectivePlan, loading };
};
