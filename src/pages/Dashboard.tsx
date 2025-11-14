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
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Welcome back, {user.firstName || user.username || 'Friend'}! 👋
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready to spark some amazing conversations today?
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground">Generate Openers</h3>
            <p className="text-muted-foreground">
              Create personalized conversation starters that get replies
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Start Creating
            </Button>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground">Your Favorites</h3>
            <p className="text-muted-foreground">
              Access your saved conversation starters anytime
            </p>
            <Button onClick={() => navigate('/saved')} variant="outline" className="w-full">
              View Collection
            </Button>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-primary/20">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground">Your Plan</h3>
            <p className="text-muted-foreground">
              <span className="font-semibold capitalize text-foreground">{plan}</span> plan
            </p>
            {plan === 'free' ? (
              <Button onClick={() => setShowPaywall(true)} variant="default" className="w-full bg-bo-gradient">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            ) : (
              <Button onClick={() => navigate('/billing')} variant="outline" className="w-full">
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
