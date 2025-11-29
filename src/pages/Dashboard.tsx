import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSupabaseContext } from '@/contexts/SupabaseContext';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Zap } from 'lucide-react';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsNewUser } from '@/hooks/useIsNewUser';
import { PaywallModal } from '@/components/PaywallModal';
import { WelcomeFlow } from '@/components/WelcomeFlow';
import { ProfileCompletionPrompt } from '@/components/ProfileCompletionPrompt';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { client: supabase, isTokenReady } = useSupabaseContext();
  const { isSynced } = useClerkSyncContext();
  const { plan, loading: planLoading } = useUserPlan();
  const { profileText } = useUserProfile();
  const { isNewUser, isChecking } = useIsNewUser(isSynced);
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  // Show welcome flow for new users who haven't seen it
  useEffect(() => {
    if (isLoaded && user && !isChecking && isNewUser) {
      setShowWelcome(true);
    }
  }, [isLoaded, user, isNewUser, isChecking]);

  // Show profile completion prompt if user hasn't set up profile
  useEffect(() => {
    if (isLoaded && user && !isChecking && !planLoading && !showWelcome) {
      // Show prompt if profile is empty and user has completed welcome
      if (!profileText && !isNewUser) {
        const hasSeenProfilePrompt = localStorage.getItem('betteropnr_profile_prompt_dismissed');
        if (!hasSeenProfilePrompt) {
          setShowProfilePrompt(true);
        }
      }
    }
  }, [isLoaded, user, isChecking, planLoading, showWelcome, profileText, isNewUser]);

  const handleWelcomeComplete = async () => {
    if (!user || !isTokenReady) return;
    
    setShowWelcome(false);
    
    // Mark welcome as completed in database
    try {
      const { error } = await supabase
        .from('users')
        .update({ has_seen_welcome: true })
        .eq('clerk_user_id', user.id);
      
      if (error) {
        console.error('Error updating welcome status:', error);
      } else {
        console.log('Welcome status updated successfully');
      }
    } catch (error) {
      console.error('Error updating welcome status:', error);
    }
  };

  const handleDismissProfilePrompt = () => {
    localStorage.setItem('betteropnr_profile_prompt_dismissed', 'true');
    setShowProfilePrompt(false);
  };

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/sign-in');
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded || !user || isChecking || planLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="bg-gradient-subtle border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <div className="h-12 w-64 mx-auto bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-6 w-96 mx-auto bg-muted/50 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Flow for new users */}
      {showWelcome && (
        <WelcomeFlow 
          userName={user.firstName || user.username || 'Friend'}
          onComplete={handleWelcomeComplete}
        />
      )}

      <div className="min-h-screen bg-muted">
        {/* Compact Hero Greeting Section */}
        <motion.div 
          className="bg-gradient-subtle border-b"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-heading font-semibold text-foreground">
                Hey {user.firstName || user.username || 'Friend'}! 👋
              </h2>
              <Button onClick={() => navigate('/generator')} size="sm" className="rounded-2xl shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-6xl space-y-6">
          {/* Profile Completion Prompt */}
          {showProfilePrompt && (
            <ProfileCompletionPrompt onDismiss={handleDismissProfilePrompt} />
          )}
          <motion.div 
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">Generate Openers</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create personalized conversation starters that get replies
            </p>
            <Button onClick={() => navigate('/generator')} className="w-full text-sm sm:text-base" size="sm">
              Start Creating
            </Button>
          </Card>

          <Card className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">Your Favorites</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Access your saved conversation starters anytime
            </p>
            <Button onClick={() => navigate('/saved')} variant="outline" className="w-full text-sm sm:text-base" size="sm">
              View Collection
            </Button>
          </Card>

          <Card className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-primary/20 sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">Your Plan</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              <span className="font-semibold capitalize text-foreground">{plan}</span> plan
            </p>
            {plan === 'free' ? (
              <Button onClick={() => setShowPaywall(true)} variant="default" className="w-full bg-bo-gradient text-sm sm:text-base" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            ) : (
              <Button onClick={() => navigate('/billing')} variant="outline" className="w-full text-sm sm:text-base" size="sm">
                Manage Billing
              </Button>
            )}
          </Card>
          </motion.div>
        </div>

        <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    </>
  );
};

export default Dashboard;
