import { useLayoutEffect, useState } from "react";
import { isGuest, enterGuest, exitGuest } from "@/lib/guest";
import { isNativeApp, getPlatform } from "@/lib/platformDetection";
import { useNativeAwareAuth } from "@/hooks/useNativeAwareAuth";
import Generator from "@/pages/Generator";
import Landing from "@/pages/Landing";

export function HomeOrGenerator() {
  const native = isNativeApp() && getPlatform() === 'ios';
  // STAGE_E2: useNativeAwareAuth() is the native auth source of truth
  // (ClerkKit-backed). Direct @clerk/clerk-react auth is not used here for
  // native decisions.
  const { isLoaded, isSignedIn } = useNativeAwareAuth();
  const [, forceGuestSync] = useState(0);

  // STAGE_E2 CORRECTION 1: guest-state mutation must not happen during
  // render (render must stay a pure function of state). useLayoutEffect
  // runs synchronously after commit but before paint, so bumping local
  // state here to force a follow-up render is invisible to the user — same
  // no-flash guarantee as before, without mutating localStorage in the
  // render body.
  useLayoutEffect(() => {
    if (!native || !isLoaded) return;
    if (isSignedIn) {
      if (isGuest()) {
        console.log('[HomeOrGenerator] stale guest mode cleared — native session confirmed');
        exitGuest();
        forceGuestSync((n) => n + 1);
      }
    } else if (!isGuest()) {
      console.log('[HomeOrGenerator] native signed-out — entering guest mode');
      enterGuest();
      forceGuestSync((n) => n + 1);
    }
  }, [native, isLoaded, isSignedIn]);

  // While native auth is still resolving, don't decide guest vs
  // authenticated — that risks trapping a valid restored session behind
  // stale guest mode, or flashing guest UI before switching to Generator.
  if (native && !isLoaded) {
    console.log('[HomeOrGenerator] native auth loading — deferring guest/auth decision');
    return null;
  }

  const guest = isGuest();
  console.log('[HomeOrGenerator] render — isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'isGuest:', guest);

  if (isSignedIn || guest) {
    console.log('[HomeOrGenerator] → Generator');
    return <Generator />;
  }

  console.log('[HomeOrGenerator] → Landing');
  return <Landing />;
}
