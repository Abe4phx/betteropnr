import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRICE_IDS = {
  pro_monthly: 'price_1SQiGI7GxpG0bh7WRavu0K4M',
  pro_yearly: 'price_1SQiGb7GxpG0bh7WVHyvR74d',
  creator_monthly: 'price_1SQiGr7GxpG0bh7Woot7ZPqs',
};

export const PaywallModal = ({ open, onOpenChange }: PaywallModalProps) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast.error('User email not found. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId,
          userEmail: user.emailAddresses[0].emailAddress,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = {
    free: [
      '5 openers per day',
      '5 saved favorites',
      'Basic tone selection',
      'Community support',
    ],
    pro: [
      'Unlimited openers',
      'Unlimited favorites',
      'All tones & variations',
      'Follow-up generation',
      'Priority support',
      'No ads',
    ],
    creator: [
      'Everything in Pro',
      'AI conversation analysis',
      'Advanced customization',
      'Custom tone creation',
      'Batch generation',
      'API access (coming soon)',
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to Unlimited Sparks! ✨
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose the perfect plan for your conversation needs
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pro" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="pro" className="relative">
              Pro
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                Popular
              </span>
            </TabsTrigger>
            <TabsTrigger value="creator">Creator</TabsTrigger>
          </TabsList>

          {/* Free Plan */}
          <TabsContent value="free" className="space-y-4">
            <div className="text-center py-6">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-4">$0</p>
              <p className="text-muted-foreground mb-6">Perfect for trying out BetterOpnr</p>
            </div>
            <ul className="space-y-3">
              {features.free.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Pro Plan */}
          <TabsContent value="pro" className="space-y-4">
            <div className="text-center py-6 border-2 border-primary rounded-lg p-6 bg-primary/5">
              <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>Monthly</span>
                <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                <span className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
                  Yearly <span className="text-primary text-sm">(Save 50%!)</span>
                </span>
              </div>

              {isYearly ? (
                <>
                  <p className="text-3xl font-bold mb-1">$29.99/year</p>
                  <p className="text-sm text-muted-foreground mb-4">Just $2.50/month</p>
                </>
              ) : (
                <p className="text-3xl font-bold mb-4">$4.99/month</p>
              )}

              <Button 
                onClick={() => handleUpgrade(
                  isYearly ? PRICE_IDS.pro_yearly : PRICE_IDS.pro_monthly,
                  'Pro'
                )}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </div>
            <ul className="space-y-3">
              {features.pro.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Creator Plan */}
          <TabsContent value="creator" className="space-y-4">
            <div className="text-center py-6">
              <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-2xl font-bold mb-2">Creator</h3>
              <p className="text-3xl font-bold mb-2">$9.99/month</p>
              <p className="text-muted-foreground mb-6">For power users and professionals</p>
              <Button 
                onClick={() => handleUpgrade(PRICE_IDS.creator_monthly, 'Creator')}
                disabled={loading}
                size="lg"
                className="w-full"
                variant="secondary"
              >
                {loading ? 'Processing...' : 'Upgrade to Creator'}
              </Button>
            </div>
            <ul className="space-y-3">
              {features.creator.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
