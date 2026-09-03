import { ReactNode, useLayoutEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isGuest, enterGuest, exitGuest } from "@/lib/guest";
import { isNativeApp } from "@/lib/platformDetection";
import { useNativeAwareAuth } from "@/hooks/useNativeAwareAuth";

export function RequireAuthOrGuest({ children }: { children: ReactNode }) {
  const location = useLocation();
  const native = isNativeApp();
  // STAGE_E2: useNativeAwareAuth() is the native auth source of truth
  // (ClerkKit-backed). Native authorization no longer reads the legacy
  // betteropnr_native_session_token / betteropnr_native_supabase_token
  // deep-link tokens — those are Stage E3/E4 concerns.
  const { isLoaded, isSignedIn } = useNativeAwareAuth();
  const [, forceGuestSync] = useState(0);

  // STAGE_E2 CORRECTION 1: guest-state mutation must not happen during
  // render — see HomeOrGenerator.tsx for the same pattern and rationale.
  useLayoutEffect(() => {
    if (!native || !isLoaded) return;
    if (isSignedIn) {
      if (isGuest()) {
        console.log("[RequireAuthOrGuest] stale guest mode cleared — native session confirmed");
        exitGuest();
        forceGuestSync((n) => n + 1);
      }
    } else if (!isGuest()) {
      console.log("[RequireAuthOrGuest] native signed-out — entering guest mode");
      enterGuest();
      forceGuestSync((n) => n + 1);
    }
  }, [native, isLoaded, isSignedIn]);

  const guest = isGuest();

  // Full state log on every render so we can see the exact snapshot
  // when the redirect fires.
  console.log(
    "[RequireAuthOrGuest] render",
    "| pathname:", location.pathname,
    "| isLoaded:", isLoaded,
    "| isSignedIn:", isSignedIn,
    "| isGuest:", guest,
    "| native:", native,
  );

  if (native) {
    // While native auth is still resolving, don't decide auth vs guest, and
    // don't redirect — that risks trapping a valid restored session behind
    // stale guest mode, or flashing guest UI before switching to auth.
    if (!isLoaded) {
      console.log("[RequireAuthOrGuest] native auth loading — deferring decision");
      return null;
    }

    // This route accepts guest OR authenticated — native access is always
    // granted once auth resolves; the effect above reconciles which state
    // (guest vs authenticated) persists in localStorage.
    return <>{children}</>;
  }

  // Pass through if authorised via any mechanism (web)
  if (isSignedIn || guest) return <>{children}</>;

  // While Clerk is loading on web, don't redirect yet.
  if (!isLoaded) return <>{children}</>;

  console.trace("[RequireAuthOrGuest] → Navigate to /sign-in  (web, Clerk loaded, no auth/guest)");
  return <Navigate to="/sign-in" state={{ from: location }} replace />;
}
