import { useAuth, useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";
import { isNativeApp } from "@/lib/platformDetection";
import { isGuest } from "@/lib/guest";
import {
  getNativeAuthState,
  getNativeAuthToken,
  type ClerkNativeAuthState,
} from "@/lib/clerkNativeAuth";

const NATIVE_AUTH_STATE_LOADING: ClerkNativeAuthState = {
  isSignedIn: false,
  userId: null,
  sessionId: null,
  isLoaded: false,
};

export const useNativeAwareAuth = () => {
  const isNative = isNativeApp();
  const { user, isLoaded: webIsLoaded } = useUser();
  const { getToken: getWebToken, isSignedIn: webIsSignedIn } = useAuth();

  const [nativeAuthState, setNativeAuthState] = useState<ClerkNativeAuthState>(
    NATIVE_AUTH_STATE_LOADING,
  );
  const [nativeAuthResolved, setNativeAuthResolved] = useState(false);

  // STAGE_E1: On native, ClerkKit (via the ClerkNativeAuth bridge) is the
  // source of truth for auth state — resolved once, asynchronously, on
  // mount. isLoaded must not report true until this resolves, so a valid
  // restored native session is never missed by a caller that only checks
  // isLoaded once.
  useEffect(() => {
    if (!isNative) return;
    let cancelled = false;

    console.log("[NativeAwareAuth] native auth loading");
    getNativeAuthState().then((state) => {
      if (cancelled) return;
      setNativeAuthState(state);
      setNativeAuthResolved(true);
      console.log("[NativeAwareAuth] native auth resolved", {
        isSignedIn: state.isSignedIn,
        hasUserId: Boolean(state.userId),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [isNative]);

  const guestMode = isGuest();

  const isLoaded = isNative ? nativeAuthResolved : webIsLoaded;

  // STAGE_E2_GUEST_RECONCILIATION: on native, ClerkKit is the source of
  // truth for auth state, so a restored session must be reported as
  // signed-in even while stale guest mode is still persisted from a
  // previous app state — callers (HomeOrGenerator, RequireAuthOrGuest) use
  // this to detect the conflict and call exitGuest() once. Guest mode still
  // suppresses web sign-in state; that path is unchanged from Stage E1.
  const isSignedIn = isNative
    ? nativeAuthState.isSignedIn
    : guestMode
      ? false
      : Boolean(webIsSignedIn);

  const userId = guestMode
    ? null
    : isNative
      ? nativeAuthState.userId
      : (user?.id ?? null);

  const isNativeAuthenticated = isNative && !guestMode && isSignedIn;

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (guestMode) return null;

    if (isNative) {
      const { token } = await getNativeAuthToken();
      console.log("[NativeAwareAuth] token requested", {
        source: "clerkkit",
        hasToken: Boolean(token),
      });
      return token;
    }

    const webToken = await getWebToken();
    return webToken ?? null;
  }, [guestMode, isNative, getWebToken]);

  return {
    user,
    isLoaded,
    isSignedIn,
    isNativeAuthenticated,
    // Kept for backward compatibility with existing callers that read a
    // synchronous token — no longer populated: native tokens are only ever
    // available on demand via getAuthToken(), never persisted or decoded.
    nativeToken: null as string | null,
    userId,
    firstName: user?.firstName ?? null,
    username: user?.username ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    getAuthToken,
  };
};
