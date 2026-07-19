import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNativeAwareAuth } from '@/hooks/useNativeAwareAuth';
import { isNativeApp, getPlatform } from '@/lib/platformDetection';
import { getSubscriptionStatus } from '@/lib/storekit';

interface ClerkSyncContextType {
  isSynced: boolean;
  user: ReturnType<typeof useNativeAwareAuth>['user'];
  isLoaded: boolean;
  isNativeSubscribed: boolean;
  // STOREKIT_BACKEND_SYNC: call immediately after any verified native
  // purchase/restore, independent of whether the backend sync call below
  // succeeds — StoreKit itself already confirmed the entitlement is real.
  markNativeSubscribed: () => void;
  // Bump after any successful sync-apple-subscription call so every
  // mounted useUserPlan() instance re-fetches the backend plan. This is
  // the smallest existing refresh mechanism: it re-runs useUserPlan()'s
  // own fetch effect via a shared dependency, not a new state store.
  planSyncVersion: number;
  notifyPlanSynced: () => void;
}

const ClerkSyncContext = createContext<ClerkSyncContextType | null>(null);

export const ClerkSyncProvider = ({ children }: { children: ReactNode }) => {
  const { user, userId, firstName, username, isLoaded, getAuthToken } = useNativeAwareAuth();
  const hasAttemptedSync = useRef(false);
  const [isSynced, setIsSynced] = useState(false);
  const hasCheckedNativeEntitlement = useRef(false);
  const [isNativeSubscribed, setIsNativeSubscribed] = useState(false);
  const [pendingAppleSync, setPendingAppleSync] = useState<string | null>(null);
  const hasSyncedAppleSubscription = useRef(false);
  const [planSyncVersion, setPlanSyncVersion] = useState(0);

  const markNativeSubscribed = useCallback(() => {
    setIsNativeSubscribed(true);
  }, []);

  const notifyPlanSynced = useCallback(() => {
    setPlanSyncVersion((v) => v + 1);
  }, []);

  // STOREKIT_STARTUP_CHECK: Once per app session, check current StoreKit
  // entitlements on native iOS so an existing subscriber is recognized
  // without visiting the Billing page. Uses getSubscriptionStatus() only —
  // never restorePurchases()/AppStore.sync() — so no StoreKit login prompt
  // is shown. Failures are logged and do not block app startup.
  useEffect(() => {
    if (hasCheckedNativeEntitlement.current) return;
    if (!(isNativeApp() && getPlatform() === 'ios')) return;
    hasCheckedNativeEntitlement.current = true;

    getSubscriptionStatus()
      .then((status) => {
        setIsNativeSubscribed(status.isSubscribed);
        if (status.isSubscribed && status.activeTransaction) {
          setPendingAppleSync(status.activeTransaction.signedTransactionInfo);
        }
      })
      .catch((error) => {
        console.error('[ClerkSyncContext] Native entitlement check failed:', error);
      });
  }, []);

  // STOREKIT_BACKEND_SYNC: once we have both a verified active native
  // entitlement (from the startup check above) and a Clerk-authenticated
  // user, sync it to the backend once per app session. Does not call
  // AppStore.sync() — only reuses the JWS the startup check already
  // obtained from getSubscriptionStatus() — and never blocks app startup;
  // failures are logged and simply leave the backend plan to catch up on a
  // future session or via Restore Purchases.
  useEffect(() => {
    if (!pendingAppleSync) return;
    if (!isLoaded || !userId) return;
    if (hasSyncedAppleSubscription.current) return;
    hasSyncedAppleSubscription.current = true;

    const syncStartupEntitlement = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;
        const { data, error } = await supabase.functions.invoke('sync-apple-subscription', {
          body: { signedTransactionInfo: pendingAppleSync },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (error || !data?.verified) {
          console.error(
            '[ClerkSyncContext] Startup Apple subscription sync failed:',
            error ?? data?.error,
          );
          return;
        }
        notifyPlanSynced();
      } catch (error) {
        console.error('[ClerkSyncContext] Startup Apple subscription sync threw:', error);
      }
    };

    syncStartupEntitlement();
  }, [pendingAppleSync, isLoaded, userId, getAuthToken, notifyPlanSynced]);

  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isLoaded || !userId) return;

      // Only attempt sync once per session
      if (hasAttemptedSync.current) return;

      try {
        console.log('Syncing user to Supabase via edge function:', userId);
        hasAttemptedSync.current = true;
        
        const token = await getAuthToken();
        if (!token) {
          console.error('No auth token available for sync');
          setIsSynced(true); // Mark as synced to prevent hanging
          return;
        }

        const { data, error } = await supabase.functions.invoke('user-profile', {
          body: {
            action: 'sync',
            username: username || firstName || 'User',
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (error) {
          console.error('Error syncing user:', error);
        } else {
          console.log('User sync result:', data);
        }

        setIsSynced(true);
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
        setIsSynced(true); // Mark as synced even on error to prevent hanging
      }
    };

    syncUserToSupabase();
  }, [userId, firstName, username, isLoaded, getAuthToken]);

  // Reset sync flag when user changes
  useEffect(() => {
    hasAttemptedSync.current = false;
    setIsSynced(false);
  }, [userId]);

  return (
    <ClerkSyncContext.Provider
      value={{
        isSynced,
        user: user ?? null,
        isLoaded,
        isNativeSubscribed,
        markNativeSubscribed,
        planSyncVersion,
        notifyPlanSynced,
      }}
    >
      {children}
    </ClerkSyncContext.Provider>
  );
};

export const useClerkSyncContext = () => {
  const context = useContext(ClerkSyncContext);
  if (!context) {
    throw new Error('useClerkSyncContext must be used within ClerkSyncProvider');
  }
  return context;
};
