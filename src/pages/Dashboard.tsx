import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Zap } from 'lucide-react';
import { useUserPlan } from '@/hooks/useUserPlan';
import { PaywallModal } from '@/components/PaywallModal';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { plan } = useUserPlan();
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/sign-in');
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Hero Greeting Section */}
      <div className="bg-gradient-subtle border-b">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground px-2">
              Welcome back, {user.firstName || user.username || 'Friend'}! 👋
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-3">
              Ready to spark some amazing conversations today?
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <Card className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-foreground">Generate Openers</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create personalized conversation starters that get replies
            </p>
            <Button onClick={() => navigate('/')} className="w-full text-sm sm:text-base" size="sm">
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
        </div>
      </div>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
};

export default Dashboard;
