import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Zap } from 'lucide-react';
import { useUserPlan } from '@/hooks/useUserPlan';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { plan } = useUserPlan();
  const navigate = useNavigate();

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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Welcome, {user.firstName || user.username || 'Friend'}! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            You're all set to create amazing conversation starters
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Generate Openers</h3>
            <p className="text-muted-foreground">
              Create personalized conversation starters based on profiles
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Start Now
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Your Favorites</h3>
            <p className="text-muted-foreground">
              View and manage your saved conversation starters
            </p>
            <Button onClick={() => navigate('/saved')} variant="outline" className="w-full">
              View Saved
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Your Plan</h3>
            <p className="text-muted-foreground">
              Current plan: <span className="font-semibold capitalize">{plan}</span>
            </p>
            {plan === 'free' && (
              <Button variant="default" className="w-full">
                Upgrade Now
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
