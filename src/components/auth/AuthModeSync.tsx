import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Capacitor } from "@capacitor/core";
import { exitGuest } from "@/lib/guest";
import { isNativeApp } from "@/lib/platformDetection";

export function AuthModeSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    const nativeByCapacitor = Capacitor.isNativePlatform();
    const nativeByHelper = isNativeApp();
    const shouldExitGuest = isLoaded && isSignedIn && Boolean(userId);

    console.log("[AuthModeSync]", {
      nativeByCapacitor,
      nativeByHelper,
      isLoaded,
      isSignedIn,
      userId,
      action:
        nativeByCapacitor || nativeByHelper
          ? "skip:native"
          : shouldExitGuest
            ? "call:exitGuest"
            : "skip:not-signed-in",
    });

    if (nativeByCapacitor) {
      console.log("[AuthModeSync] skipped exitGuest: Capacitor native platform");
      return;
    }

    // On native iOS, intentionalNavigateToSignIn() calls exitGuest() before
    // any real sign-in flow. Clearing guest mode here would break the App
    // Review flow because Clerk can transiently report signed-in state during
    // its proxy handshake before correcting back to false.
    if (nativeByHelper) {
      console.log("[AuthModeSync] skipped exitGuest: native helper");
      return;
    }

    // Only convert guest mode to user mode after Clerk has fully loaded an
    // actual user. This keeps guest mode stable through transient auth states.
    if (shouldExitGuest) {
      console.log("[AuthModeSync] calling exitGuest");
      exitGuest();
      return;
    }

    console.log("[AuthModeSync] skipped exitGuest: not signed in");
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
