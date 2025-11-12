import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPlan } from './useUserPlan';

interface UsageData {
  openers_generated: number;
  favorites_count: number;
  hasExceededOpenerLimit: boolean;
  hasExceededFavoriteLimit: boolean;
}

export const useUsageTracking = () => {
  const { user } = useUser();
  const { plan } = useUserPlan();
  const [usage, setUsage] = useState<UsageData>({
    openers_generated: 0,
    favorites_count: 0,
    hasExceededOpenerLimit: false,
    hasExceededFavoriteLimit: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's usage
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (usageError && usageError.code !== 'PGRST116') {
        throw usageError;
      }

      const openers = usageData?.openers_generated || 0;
      const favorites = usageData?.favorites_count || 0;

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
  };

  useEffect(() => {
    fetchUsage();
  }, [user, plan]);

  const incrementOpeners = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_usage')
          .update({ openers_generated: existing.openers_generated + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_usage')
          .insert({
            user_id: user.id,
            date: today,
            openers_generated: 1,
            favorites_count: 0,
          });
      }

      await fetchUsage();
    } catch (error) {
      console.error('Error incrementing openers:', error);
    }
  };

  const incrementFavorites = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_usage')
          .update({ favorites_count: existing.favorites_count + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_usage')
          .insert({
            user_id: user.id,
            date: today,
            openers_generated: 0,
            favorites_count: 1,
          });
      }

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
