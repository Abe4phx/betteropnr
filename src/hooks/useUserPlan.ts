import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabaseContext } from '@/contexts/SupabaseContext';

export const useUserPlan = () => {
  const { user } = useUser();
  const { client: supabase, isTokenReady } = useSupabaseContext();
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPlan = async () => {
      // Wait for user AND token to be ready
      if (!user || !isTokenReady) {
        return; // Don't set loading to false yet - still waiting
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('plan')
          .eq('clerk_user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) setPlan(data.plan);
      } catch (error) {
        console.error('Error fetching user plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user, isTokenReady, supabase]);

  return { plan, loading };
};
