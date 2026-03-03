import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { configureRevenueCat, loginRevenueCat, logoutRevenueCat } from "@/lib/revenuecat";

export function RevenueCatAuthBridge() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    configureRevenueCat().catch(console.error);
  }, []);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      loginRevenueCat(user.id).catch(console.error);
      return;
    }
    logoutRevenueCat().catch(console.error);
  }, [isSignedIn, user?.id]);

  return null;
}
