import { registerPlugin, Capacitor } from '@capacitor/core';

export interface StoreKitProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  localizedPrice: string;
}

// A verified StoreKit transaction, including the raw Apple-signed JWS
// (signedTransactionInfo) needed for server-side verification. Never log
// or expose signedTransactionInfo outside of the authenticated sync call
// it's sent to.
export interface StoreKitSignedTransaction {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: string;
  expirationDate?: string;
  environment: string;
  signedTransactionInfo: string;
}

export type StoreKitPurchaseResult = StoreKitSignedTransaction;

export interface StoreKitSubscriptionStatus {
  isSubscribed: boolean;
  productIds: string[];
  activeTransaction?: StoreKitSignedTransaction;
}

interface StoreKitPlugin {
  getProducts(options: { productIds: string[] }): Promise<{ products: StoreKitProduct[] }>;
  purchase(options: { productId: string }): Promise<StoreKitPurchaseResult>;
  restorePurchases(): Promise<StoreKitSubscriptionStatus>;
  getSubscriptionStatus(): Promise<StoreKitSubscriptionStatus>;
}

const NativeStoreKit = registerPlugin<StoreKitPlugin>('StoreKit');

export const PRODUCT_MONTHLY = 'betteropnr.premium.monthly';
export const PRODUCT_YEARLY = 'betteropnr.premium.yearly';

export async function getProducts(): Promise<StoreKitProduct[]> {
  if (!Capacitor.isNativePlatform()) return [];
  const { products } = await NativeStoreKit.getProducts({
    productIds: [PRODUCT_MONTHLY, PRODUCT_YEARLY],
  });
  return products;
}

export async function purchaseMonthly(): Promise<StoreKitPurchaseResult | null> {
  if (!Capacitor.isNativePlatform()) return null;
  return NativeStoreKit.purchase({ productId: PRODUCT_MONTHLY });
}

export async function purchaseYearly(): Promise<StoreKitPurchaseResult | null> {
  if (!Capacitor.isNativePlatform()) return null;
  return NativeStoreKit.purchase({ productId: PRODUCT_YEARLY });
}

export async function restorePurchases(): Promise<StoreKitSubscriptionStatus> {
  if (!Capacitor.isNativePlatform()) return { isSubscribed: false, productIds: [] };
  return NativeStoreKit.restorePurchases();
}

export async function getSubscriptionStatus(): Promise<StoreKitSubscriptionStatus> {
  if (!Capacitor.isNativePlatform()) return { isSubscribed: false, productIds: [] };
  return NativeStoreKit.getSubscriptionStatus();
}

// Extracts the signed JWS to send to sync-apple-subscription from any of
// the three native call shapes above. Returns null when there is no
// verified active transaction to sync (e.g. a null purchase result, or a
// status/restore result with isSubscribed: false).
export function extractSignedTransaction(
  result: StoreKitPurchaseResult | StoreKitSubscriptionStatus | null,
): string | null {
  if (!result) return null;
  if ('signedTransactionInfo' in result) return result.signedTransactionInfo;
  if ('activeTransaction' in result && result.activeTransaction) {
    return result.activeTransaction.signedTransactionInfo;
  }
  return null;
}
