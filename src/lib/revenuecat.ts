// src/lib/revenuecat.ts
import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
} from "@revenuecat/purchases-capacitor";

const RC_API_KEY = "test_BmbVMnVlRiZDWWkhRsTJdFmTmdl";
export const RC_ENTITLEMENT_ID = "BetterOpnr Pro";

// Optional: product IDs (handy for debugging / direct checks)
export const RC_PRODUCT_MONTHLY = "betteropnr.premium.monthly";
export const RC_PRODUCT_YEARLY = "betteropnr.premium.yearly";

let configured = false;

/**
 * Call once at app startup.
 * Only configures on native iOS/Android. Does nothing on web.
 */
export async function configureRevenueCat(): Promise<void> {
  if (configured) return;

  const isNative = Capacitor.isNativePlatform();
  if (!isNative) return;

  // Helpful during setup; you can reduce later.
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

  await Purchases.configure({
    apiKey: RC_API_KEY,
  });

  configured = true;
}

/**
 * Identify the user in RevenueCat using your auth user id (Clerk userId).
 * Call whenever user logs in, and call logOut when they log out.
 */
export async function loginRevenueCat(appUserId: string): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  await configureRevenueCat();

  const { customerInfo } = await Purchases.logIn({ appUserID: appUserId });
  return customerInfo;
}

export async function logoutRevenueCat(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await configureRevenueCat();
  await Purchases.logOut();
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  await configureRevenueCat();

  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo;
}

export function isProActive(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;

  // RevenueCat entitlements are keyed by the entitlement identifier
  const ent = customerInfo.entitlements.active[RC_ENTITLEMENT_ID];
  return Boolean(ent);
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!Capacitor.isNativePlatform()) return null;
  await configureRevenueCat();

  const { current } = await Purchases.getOfferings();
  return current ?? null;
}

export async function purchaseMonthly(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  await configureRevenueCat();

  const offering = await getCurrentOffering();
  const pkg = offering?.monthly;
  if (!pkg) throw new Error("Monthly package not found in RevenueCat offering.");

  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return customerInfo;
}

export async function purchaseYearly(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  await configureRevenueCat();

  const offering = await getCurrentOffering();
  const pkg = offering?.annual;
  if (!pkg) throw new Error("Annual package not found in RevenueCat offering.");

  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  await configureRevenueCat();

  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}
