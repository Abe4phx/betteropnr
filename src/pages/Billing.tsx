import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap, ExternalLink, Info } from 'lucide-react';
import { useUserPlan } from '@/hooks/useUserPlan';
import { toast } from 'sonner';
import { UpgradeSuccessModal } from '@/components/UpgradeSuccessModal';
import { isNativeApp, getPlatform } from '@/lib/platformDetection';

const Billing = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const supabase = useSupabase();
  const { plan, loading } = useUserPlan();
  const [portalLoading, setPortalLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Check if running on iOS native app
  const isIOSNative = isNativeApp() && getPlatform() === 'ios';

  useEffect(() => {
    // Check if user just completed checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessModal(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/sign-in');
    }
  }, [user, isLoaded, navigate]);

  const handleManageSubscription = async () => {
    // On iOS native, redirect to web for subscription management
    if (isIOSNative) {
      toast.info('Opening subscription management in browser...', { duration: 3000 });
      window.open('https://betteropnr.com/billing', '_blank');
      return;
    }
    
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (!isLoaded || loading || !user) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const planConfig = {
    free: {
      icon: Sparkles,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      features: ['5 openers per day', '5 saved favorites', 'Basic tone selection', 'Community support'],
    },
    pro: {
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      features: ['Unlimited openers', 'Unlimited favorites', 'All tones & variations', 'Follow-up generation', 'Priority support'],
    },
    creator: {
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      features: ['Everything in Pro', 'AI conversation analysis', 'Advanced customization', 'Custom tone creation', 'Batch generation'],
    },
  };

  const currentPlanConfig = planConfig[plan as keyof typeof planConfig] || planConfig.free;
  const Icon = currentPlanConfig.icon;

  return (
    <>
      <div className="container max-w-4xl mx-auto py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your BetterOpnr subscription</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Current Plan
                  <Badge className={currentPlanConfig.bgColor}>
                    <Icon className={`w-3 h-3 mr-1 ${currentPlanConfig.color}`} />
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {plan === 'free' 
                    ? 'Upgrade to unlock unlimited features' 
                    : 'Thank you for being a premium member!'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Your Plan Includes:</h3>
              <ul className="space-y-2">
                {currentPlanConfig.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${currentPlanConfig.color}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan !== 'free' && (
              <div className="pt-4 border-t">
                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {portalLoading ? 'Loading...' : 'Manage Subscription'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {isIOSNative 
                    ? 'Opens in your web browser for subscription management'
                    : 'Update payment method, view invoices, or cancel your subscription'}
                </p>
              </div>
            )}

            {plan === 'free' && (
              <div className="pt-4 border-t">
                {isIOSNative ? (
                  <>
                    <Button
                      onClick={() => window.open('https://betteropnr.com/billing', '_blank')}
                      className="w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Upgrade via Web
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Subscriptions are managed through our website
                    </p>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate('/')}
                      className="w-full sm:w-auto"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Get unlimited access to all features
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Information</CardTitle>
            <CardDescription>
              Your current usage and limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plan === 'free' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Openers</span>
                  <span className="text-sm font-medium">5 per day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Saved Favorites</span>
                  <span className="text-sm font-medium">5 total</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-semibold mb-2">Unlimited Everything!</p>
                <p className="text-sm text-muted-foreground">
                  You have access to unlimited openers and favorites
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UpgradeSuccessModal 
        open={showSuccessModal} 
        onOpenChange={setShowSuccessModal} 
      />
    </>
  );
};

export default Billing;
