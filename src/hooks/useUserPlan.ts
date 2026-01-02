import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserPlan = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { isSynced } = useClerkSyncContext();
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      // Wait for user AND sync to be ready
      if (!user || !isSynced) {
        return;
      }

      try {
        const token = await getToken();
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
  }, [user, isSynced, getToken]);

  return { plan, loading };
};
