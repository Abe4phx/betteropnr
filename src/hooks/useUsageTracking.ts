import { useEffect, useState, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import { useUserPlan } from './useUserPlan';
import { supabase } from '@/integrations/supabase/client';

interface UsageData {
  openers_generated: number;
  favorites_count: number;
  hasExceededOpenerLimit: boolean;
  hasExceededFavoriteLimit: boolean;
}

export const useUsageTracking = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { plan } = useUserPlan();
  const { isSynced } = useClerkSyncContext();
  const [usage, setUsage] = useState<UsageData>({
    openers_generated: 0,
    favorites_count: 0,
    hasExceededOpenerLimit: false,
    hasExceededFavoriteLimit: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user || !isSynced) {
      if (!user) {
        setLoading(false);
      }
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token available for usage');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('user-usage', {
        body: { action: 'get' },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) {
        console.error('Error fetching usage:', error);
        setLoading(false);
        return;
      }

      const openers = data?.openers_generated || 0;
      const favorites = data?.favorites_count || 0;

      // Free plan limits: 5 openers per day, 5 favorites total
      const hasExceededOpenerLimit = plan === 'free' && openers >= 5;
      const hasExceededFavoriteLimit = plan === 'free' && favorites >= 5;

      setUsage({
        openers_generated: openers,
        favorites_count: favorites,
        hasExceededOpenerLimit,
        hasExceededFavoriteLimit,
      });
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isSynced, plan, getToken]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const incrementOpeners = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      if (!token) return;

      await supabase.functions.invoke('user-usage', {
        body: { action: 'incrementOpeners' },
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchUsage();
    } catch (error) {
      console.error('Error incrementing openers:', error);
    }
  };

  const incrementFavorites = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      if (!token) return;

      await supabase.functions.invoke('user-usage', {
        body: { action: 'incrementFavorites' },
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchUsage();
    } catch (error) {
      console.error('Error incrementing favorites:', error);
    }
  };

  return {
    usage,
    loading,
    incrementOpeners,
    incrementFavorites,
    refreshUsage: fetchUsage,
  };
};
