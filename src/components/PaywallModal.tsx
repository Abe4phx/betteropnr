import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { isNativeApp, getPlatform } from '@/lib/platformDetection';
import { purchaseMonthly, purchaseYearly, restorePurchases, extractSignedTransaction } from '@/lib/storekit';
import { useAuthedFunctionInvoke } from '@/hooks/useAuthedFunctionInvoke';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';


interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Feature flag - set to true when ready to launch Creator tier
const SHOW_CREATOR_TIER = false;

const PRICE_IDS = {
  pro_monthly: 'price_1SQiGI7GxpG0bh7WRavu0K4M',
  pro_yearly: 'price_1SQiGb7GxpG0bh7WVHyvR74d',
  creator_monthly: 'price_1SQiGr7GxpG0bh7Woot7ZPqs',
};

export const PaywallModal = ({ open, onOpenChange }: PaywallModalProps) => {
  const { user } = useUser();
  const { invoke } = useAuthedFunctionInvoke();
  const { markNativeSubscribed, notifyPlanSynced } = useClerkSyncContext();
  const [loading, setLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Check if running on iOS native app (Apple IAP required)
  const isIOSNative = isNativeApp() && getPlatform() === 'ios';

  type BillingPlan = "monthly" | "yearly";

  // STOREKIT_BACKEND_SYNC: sends the verified signed transaction to the
  // authenticated sync-apple-subscription function, which independently
  // re-verifies it server-side before updating the backend plan. Returns
  // whether the backend sync succeeded — never assume success from a local
  // StoreKit result alone.
  const syncAppleSubscription = async (signedTransactionInfo: string): Promise<boolean> => {
    try {
      const { data, error } = await invoke<{ verified: boolean; error?: string }>(
        'sync-apple-subscription',
        { body: { signedTransactionInfo } },
      );
      if (error || !data?.verified) {
        console.error('[PaywallModal] Apple subscription sync failed:', error ?? data?.error);
        return false;
      }
      notifyPlanSynced();
      return true;
    } catch (err) {
      console.error('[PaywallModal] Apple subscription sync threw:', err);
      return false;
    }
  };

  const handleUpgrade = async (plan: BillingPlan) => {
    if (isIOSNative) {
      setLoading(true);
      try {
        const result = plan === 'yearly' ? await purchaseYearly() : await purchaseMonthly();
        const signedTransactionInfo = extractSignedTransaction(result);
        if (result && signedTransactionInfo) {
          // StoreKit itself already verified this transaction — unlock the
          // UI immediately regardless of backend sync timing.
          markNativeSubscribed();
          const syncOk = await syncAppleSubscription(signedTransactionInfo);
          if (syncOk) {
            toast.success('Subscription activated!');
            onOpenChange(false);
          } else {
            // Do not tell the user the purchase failed — it succeeded on
            // Apple's side. Keep the paywall open so Restore Purchases
            // remains available as a retry path.
            toast(
              'Purchase successful — finishing account activation. If this doesn’t update shortly, try Restore Purchases.',
            );
          }
        } else if (result) {
          // Purchase resolved but no signed transaction was returned —
          // should not normally happen, but never claim success silently.
          console.error('[PaywallModal] Purchase result missing signedTransactionInfo');
          toast.error('Could not verify your purchase. Please try again.');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Purchase failed.';
        if (msg !== 'USER_CANCELLED' && msg !== 'PENDING') {
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    const email = user?.primaryEmailAddress?.emailAddress ?? (user as any)?.email ?? null;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    setLoading(true);
    try {
      const res = await fetch(
        "https://vshitqqftdekgtjanyaa.supabase.co/functions/v1/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan, email }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Checkout failed (${res.status})`);
      if (!data?.url) throw new Error("Checkout failed: missing session url");

      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error creating checkout:', err);
      toast.error(err.message ?? 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const status = await restorePurchases();
      const signedTransactionInfo = extractSignedTransaction(status);
      if (status.isSubscribed && signedTransactionInfo) {
        markNativeSubscribed();
        const syncOk = await syncAppleSubscription(signedTransactionInfo);
        if (syncOk) {
          toast.success('Subscription restored!');
          onOpenChange(false);
        } else {
          toast(
            'Subscription found — finishing account activation. Please try again in a moment if this persists.',
          );
        }
      } else if (status.isSubscribed) {
        // Active entitlement found but no signed transaction was returned
        // — should not normally happen, but fail safely rather than
        // silently claiming success.
        console.error('[PaywallModal] Restore result missing signedTransactionInfo');
        toast.error('Could not verify your subscription. Please try again.');
      } else {
        toast('No active subscription found to restore.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Restore failed. Please try again.';
      toast.error(msg);
    } finally {
      setRestoring(false);
    }
  };

  const premiumFeatures = [
    'More AI-generated suggestions per day',
    'Advanced tone options',
    'Save and reuse favorite openers',
    'Faster generation during peak times',
  ];

  const features = {
    free: [
      '5 suggestions per day',
      '5 saved favorites',
      'Basic tone selection',
    ],
    pro: premiumFeatures,
    creator: [
      ...premiumFeatures,
      'AI conversation analysis',
      'Custom tone creation',
      'Batch generation',
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
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-center text-foreground">
              Upgrade to BetterOpnr Premium
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground">
              Unlock advanced features and higher usage limits.
            </DialogDescription>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Subscription optional. The app works without upgrading.
            </p>
          </DialogHeader>

          <Tabs defaultValue="pro" className="w-full mt-6">
            <TabsList className={`grid w-full ${SHOW_CREATOR_TIER ? 'grid-cols-3' : 'grid-cols-2'} bg-muted/50 rounded-2xl p-1`}>
              <TabsTrigger value="free" className="rounded-xl">Free</TabsTrigger>
              <TabsTrigger value="pro" className="relative rounded-xl">
                Pro
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-ts-coral to-ts-yellow text-white text-xs px-3 py-1 rounded-full shadow-md">
                  Popular
                </span>
              </TabsTrigger>
              {SHOW_CREATOR_TIER && (
                <TabsTrigger value="creator" className="rounded-xl">Creator</TabsTrigger>
              )}
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
                onClick={() => handleUpgrade(isYearly ? 'yearly' : 'monthly')}
                disabled={loading}
                size="lg"
                className="w-full shadow-md hover:shadow-lg bg-primary hover:bg-primary/90"
              >
                {loading ? 'Processing...' : 'Subscribe'}
              </Button>
              
              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center mt-4">
                AI suggestions are optional and editable. Results may vary.
              </p>
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
          {SHOW_CREATOR_TIER && (
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
                  onClick={() => handleUpgrade('monthly')}
                  disabled={loading}
                  size="lg"
                  className="w-full shadow-md hover:shadow-lg relative overflow-hidden"
                  variant="accent"
                  style={{
                    background: 'linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--accent-foreground)) 50%, hsl(var(--accent)) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 8s linear infinite',
                  }}
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
          )}
        </Tabs>
        
        {/* Footer disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-6 px-4">
          Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.
        </p>

        {isIOSNative && (
          <div className="text-center mt-2">
            <Button
              type="button"
              variant="link"
              onClick={handleRestore}
              disabled={restoring || loading}
              className="text-xs text-muted-foreground h-auto p-0"
            >
              {restoring ? 'Restoring...' : 'Restore Purchases'}
            </Button>
          </div>
        )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
