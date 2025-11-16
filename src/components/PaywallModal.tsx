import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-ts-coral to-ts-yellow bg-clip-text text-transparent">
              Upgrade to Unlimited Sparks! ✨
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Choose the perfect plan for your conversation needs
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="pro" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-2xl p-1">
              <TabsTrigger value="free" className="rounded-xl">Free</TabsTrigger>
              <TabsTrigger value="pro" className="relative rounded-xl">
                Pro
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-ts-coral to-ts-yellow text-white text-xs px-3 py-1 rounded-full shadow-md">
                  Popular
                </span>
              </TabsTrigger>
              <TabsTrigger value="creator" className="rounded-xl">Creator</TabsTrigger>
            </TabsList>

          {/* Free Plan */}
          <TabsContent value="free" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center py-8 bg-white rounded-3xl shadow-soft"
            >
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-ts-gray-dark" />
              <h3 className="text-2xl font-bold mb-2 text-ts-navy">Free</h3>
              <p className="text-4xl font-bold mb-2 text-ts-navy">$0</p>
              <p className="text-muted-foreground mb-6">Perfect for trying out BetterOpnr</p>
            </motion.div>
            <ul className="space-y-4 px-2">
              {features.free.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-ts-gray-dark mt-0.5 flex-shrink-0" />
                  <span className="text-ts-ink">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </TabsContent>

          {/* Pro Plan */}
          <TabsContent value="pro" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center py-8 rounded-3xl p-8 bg-gradient-to-br from-ts-coral/10 via-ts-yellow/10 to-ts-coral/10 border-2 border-ts-coral/20 shadow-elegant"
            >
              <div className="bg-gradient-to-br from-ts-coral to-ts-yellow w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-ts-navy">Pro</h3>
              
              <div className="flex items-center justify-center gap-4 mb-6 bg-white/50 backdrop-blur-sm rounded-2xl p-3 max-w-md mx-auto">
                <span className={!isYearly ? 'font-semibold text-ts-navy' : 'text-muted-foreground'}>Monthly</span>
                <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                <span className={isYearly ? 'font-semibold text-ts-navy' : 'text-muted-foreground'}>
                  Yearly <span className="text-ts-coral text-sm font-bold">(Save 50%!)</span>
                </span>
              </div>

              {isYearly ? (
                <>
                  <p className="text-4xl font-bold mb-1 text-ts-navy">$29.99/year</p>
                  <p className="text-sm text-muted-foreground mb-6">Just $2.50/month</p>
                </>
              ) : (
                <p className="text-4xl font-bold mb-6 text-ts-navy">$4.99/month</p>
              )}

              <Button 
                onClick={() => handleUpgrade(
                  isYearly ? PRICE_IDS.pro_yearly : PRICE_IDS.pro_monthly,
                  'Pro'
                )}
                disabled={loading}
                size="lg"
                className="w-full shadow-md hover:shadow-lg"
              >
                {loading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </motion.div>
            <ul className="space-y-4 px-2">
              {features.pro.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-ts-coral mt-0.5 flex-shrink-0" />
                  <span className="text-ts-ink font-medium">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </TabsContent>

          {/* Creator Plan */}
          <TabsContent value="creator" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center py-8 bg-white rounded-3xl shadow-soft p-8"
            >
              <div className="bg-gradient-to-br from-ts-teal to-ts-teal/80 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2 text-ts-navy">Creator</h3>
              <p className="text-4xl font-bold mb-2 text-ts-navy">$9.99/month</p>
              <p className="text-muted-foreground mb-6">For power users and professionals</p>
              <Button 
                onClick={() => handleUpgrade(PRICE_IDS.creator_monthly, 'Creator')}
                disabled={loading}
                size="lg"
                className="w-full shadow-md hover:shadow-lg"
                variant="accent"
              >
                {loading ? 'Processing...' : 'Upgrade to Creator'}
              </Button>
            </motion.div>
            <ul className="space-y-4 px-2">
              {features.creator.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-ts-teal mt-0.5 flex-shrink-0" />
                  <span className="text-ts-ink font-medium">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
