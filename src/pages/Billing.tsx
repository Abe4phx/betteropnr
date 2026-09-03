import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap, ExternalLink, RefreshCw } from 'lucide-react';
import { useUserPlan } from '@/hooks/useUserPlan';
import { toast } from 'sonner';
import { UpgradeSuccessModal } from '@/components/UpgradeSuccessModal';
import { isNativeApp, getPlatform } from '@/lib/platformDetection';
import { useAuthedFunctionInvoke } from '@/hooks/useAuthedFunctionInvoke';
import { useClerkSyncContext } from '@/contexts/ClerkSyncContext';
import {
  purchaseMonthly,
  purchaseYearly,
  restorePurchases,
  getSubscriptionStatus,
  extractSignedTransaction,
  getProducts,
  type StoreKitProduct,
} from '@/lib/storekit';

const Billing = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { invoke } = useAuthedFunctionInvoke();
  const { markNativeSubscribed, notifyPlanSynced } = useClerkSyncContext();
  const { plan, loading } = useUserPlan();
  const [portalLoading, setPortalLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isIOSNative = isNativeApp() && getPlatform() === 'ios';

  // StoreKit state (iOS native only)
  const [iapLoading, setIapLoading] = useState(false);
  const [iapError, setIapError] = useState<string | null>(null);
  const [products, setProducts] = useState<StoreKitProduct[]>([]);

  // STOREKIT_BACKEND_SYNC: sends the verified signed transaction to the
  // authenticated sync-apple-subscription function, which independently
  // re-verifies it server-side before updating the backend plan. Returns
  // whether the backend sync succeeded — never assume success from a local
  // StoreKit result alone. Mirrors PaywallModal's known-working helper.
  const syncAppleSubscription = async (signedTransactionInfo: string): Promise<boolean> => {
    try {
      const { data, error } = await invoke<{ verified: boolean; error?: string }>(
        'sync-apple-subscription',
        { body: { signedTransactionInfo } },
      );
      if (error || !data?.verified) {
        console.error('[Billing] Apple subscription sync failed:', error ?? data?.error);
        return false;
      }
      notifyPlanSynced();
      return true;
    } catch (err) {
      console.error('[Billing] Apple subscription sync threw:', err);
      return false;
    }
  };

  useEffect(() => {
    if (!isIOSNative) return;
    getProducts().then(setProducts).catch(console.error);
  }, [isIOSNative]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/sign-in');
    }
  }, [user, isLoaded, navigate]);

  const handlePurchase = async (type: 'monthly' | 'yearly') => {
    setIapLoading(true);
    setIapError(null);
    try {
      const result = type === 'monthly' ? await purchaseMonthly() : await purchaseYearly();
      const signedTransactionInfo = extractSignedTransaction(result);
      if (result && signedTransactionInfo) {
        // StoreKit itself already verified this transaction — unlock the
        // UI immediately regardless of backend sync timing.
        markNativeSubscribed();
        const syncOk = await syncAppleSubscription(signedTransactionInfo);
        if (syncOk) {
          toast.success('Welcome to Pro! 🎉');
        } else {
          // Do not tell the user the purchase failed — it succeeded on
          // Apple's side. Restore Purchases remains available as a retry path.
          toast(
            'Purchase successful — finishing account activation. If this doesn’t update shortly, try Restore Purchases.',
          );
        }
      } else if (result) {
        // Purchase resolved but no signed transaction was returned —
        // should not normally happen, but never claim success silently.
        console.error('[Billing] Purchase result missing signedTransactionInfo');
        toast.error('Could not verify your purchase. Please try again.');
      }
    } catch (e: any) {
      const msg: string = e?.message ?? 'Purchase failed.';
      if (msg !== 'USER_CANCELLED' && msg !== 'PENDING') {
        setIapError(msg);
        toast.error(msg);
      }
    } finally {
      setIapLoading(false);
    }
  };

  const handleRestore = async () => {
    setIapLoading(true);
    setIapError(null);
    try {
      const status = await restorePurchases();
      const signedTransactionInfo = extractSignedTransaction(status);
      if (status.isSubscribed && signedTransactionInfo) {
        markNativeSubscribed();
        const syncOk = await syncAppleSubscription(signedTransactionInfo);
        if (syncOk) {
          toast.success('Pro restored! 🎉');
        } else {
          toast(
            'Subscription found — finishing account activation. Please try again in a moment if this persists.',
          );
        }
      } else if (status.isSubscribed) {
        // Active entitlement found but no signed transaction was returned
        // — fail safely rather than silently claiming success.
        console.error('[Billing] Restore result missing signedTransactionInfo');
        toast.error('Could not verify your subscription. Please try again.');
      } else {
        toast('No active subscription found.');
      }
    } catch (e: any) {
      const msg: string = e?.message ?? 'Restore failed.';
      setIapError(msg);
      toast.error(msg);
    } finally {
      setIapLoading(false);
    }
  };

  // "Refresh Status" must never trigger AppStore.sync() (which can prompt
  // for Apple ID credentials) — that's what "Restore Purchases" is for.
  // getSubscriptionStatus() only reads current entitlements, silently.
  const handleRefreshStatus = async () => {
    setIapLoading(true);
    setIapError(null);
    try {
      const status = await getSubscriptionStatus();
      const signedTransactionInfo = extractSignedTransaction(status);
      if (status.isSubscribed && signedTransactionInfo) {
        markNativeSubscribed();
        const syncOk = await syncAppleSubscription(signedTransactionInfo);
        if (syncOk) {
          toast.success('Subscription status updated!');
        } else {
          toast(
            'Subscription found — finishing account activation. Please try again in a moment if this persists.',
          );
        }
      } else if (status.isSubscribed) {
        // Active entitlement found but no signed transaction was returned
        // — fail safely rather than silently claiming success.
        console.error('[Billing] Refresh status result missing signedTransactionInfo');
        toast.error('Could not verify your subscription. Please try again.');
      } else {
        toast('No active subscription found.');
      }
    } catch (e: unknown) {
      const msg: string = e instanceof Error ? e.message : 'Status check failed.';
      setIapError(msg);
      toast.error(msg);
    } finally {
      setIapLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await invoke<{ url?: string }>('create-portal-session');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error(error instanceof Error ? `Failed: ${error.message}` : 'Failed to open billing portal. Please try again.');
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

  const monthlyProduct = products.find(p => p.productId === 'betteropnr.premium.monthly');
  const yearlyProduct = products.find(p => p.productId === 'betteropnr.premium.yearly');

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

            {/* iOS Native: StoreKit IAP */}
            {isIOSNative && plan === 'free' && (
              <div className="pt-4 border-t space-y-3">
                {iapError && <p className="text-sm text-destructive">{iapError}</p>}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handlePurchase('monthly')}
                    disabled={iapLoading}
                    className="flex-1"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {iapLoading
                      ? 'Processing…'
                      : monthlyProduct
                        ? `Go Pro Monthly · ${monthlyProduct.localizedPrice}`
                        : 'Go Pro Monthly'}
                  </Button>
                  <Button
                    onClick={() => handlePurchase('yearly')}
                    disabled={iapLoading}
                    className="flex-1"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {iapLoading
                      ? 'Processing…'
                      : yearlyProduct
                        ? `Go Pro Yearly · ${yearlyProduct.localizedPrice}`
                        : 'Go Pro Yearly'}
                  </Button>
                </div>
                <Button
                  onClick={handleRestore}
                  disabled={iapLoading}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {iapLoading ? 'Processing…' : 'Restore Purchases'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Purchases are processed through the App Store. Manage your subscription in iOS Settings → Apple ID → Subscriptions.
                </p>
              </div>
            )}

            {/* iOS Native: active subscription */}
            {isIOSNative && plan !== 'free' && (
              <div className="pt-4 border-t space-y-3">
                <Button
                  onClick={handleRefreshStatus}
                  disabled={iapLoading}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {iapLoading ? 'Processing…' : 'Refresh Status'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Manage your subscription in iOS Settings → Apple ID → Subscriptions
                </p>
              </div>
            )}

            {/* Web: Stripe manage subscription */}
            {!isIOSNative && plan !== 'free' && (
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
                  Update payment method, view invoices, or cancel your subscription
                </p>
              </div>
            )}

            {/* Web: Upgrade CTA */}
            {!isIOSNative && plan === 'free' && (
              <div className="pt-4 border-t">
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Information</CardTitle>
            <CardDescription>Your current usage and limits</CardDescription>
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
