import { isNativeApp, getPlatform } from '@/lib/platformDetection';

// RevenueCat publishable API key (safe for client-side, like Stripe's publishable key)
const REVENUECAT_API_KEY = 'appl_YOUR_KEY_HERE';

// Entitlement ID configured in RevenueCat dashboard
const PRO_ENTITLEMENT_ID = 'pro';

// Product identifiers matching RevenueCat offerings
const PACKAGE_MAP: Record<string, string> = {
  monthly: '$rc_monthly',
  yearly: '$rc_annual',
};

function isIOSNative(): boolean {
  return isNativeApp() && getPlatform() === 'ios';
}

/**
 * Dynamically import the RevenueCat SDK (only available on native)
 */
async function getSDK() {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  return Purchases;
}

/**
 * Configure RevenueCat SDK. Call once at app startup (native iOS only).
 */
export async function configureRevenueCat(userId?: string): Promise<void> {
  if (!isIOSNative()) return;

  const Purchases = await getSDK();
  await Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
    ...(userId ? { appUserID: userId } : {}),
  });
}

/**
 * Purchase the Pro plan via native iOS IAP.
 * Returns the customer info on success, throws on failure/cancellation.
 */
export async function purchaseProPlan(plan: 'monthly' | 'yearly') {
  if (!isIOSNative()) {
    throw new Error('Native purchases are only available on iOS');
  }

  const Purchases = await getSDK();
  const offeringsResult = await Purchases.getOfferings();

  const current = (offeringsResult as any)?.current;
  if (!current) {
    throw new Error('No offerings available. Please try again later.');
  }

  const packageId = PACKAGE_MAP[plan];
  const pkg = current.availablePackages.find((p: any) => p.identifier === packageId);

  if (!pkg) {
    throw new Error(`Package "${plan}" not found in current offering.`);
  }

  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return customerInfo;
}

/**
 * Check if the user has an active "pro" entitlement.
 */
export async function checkEntitlements(): Promise<boolean> {
  if (!isIOSNative()) return false;

  const Purchases = await getSDK();
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

/**
 * Restore previous purchases (e.g. after reinstall or device switch).
 */
export async function restorePurchases() {
  if (!isIOSNative()) {
    throw new Error('Restore is only available on iOS');
  }

  const Purchases = await getSDK();
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}
