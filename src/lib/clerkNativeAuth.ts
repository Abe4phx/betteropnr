import { registerPlugin, Capacitor } from '@capacitor/core';

// Foundation-only bridge to ClerkKit's native auth state. Not yet wired into
// any auth flow, route, or UI — see Stage C of the native Clerk migration.
export interface ClerkNativeAuthState {
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  isLoaded: boolean;
}

// The token is returned for on-demand use only. Callers must not persist or
// log it.
export interface ClerkNativeTokenResult {
  token: string | null;
  expiresAt: number | null;
}

// Stage D: result of presenting ClerkKitUI's native sign-in flow. Never
// carries a token or credentials — only the resulting auth state.
export interface ClerkNativeSignInResult {
  status: "signedIn" | "cancelled" | "failed";
  isSignedIn: boolean;
  userId: string | null;
}

interface ClerkNativeAuthPlugin {
  getAuthState(): Promise<ClerkNativeAuthState>;
  getToken(): Promise<ClerkNativeTokenResult>;
  signOut(): Promise<void>;
  isReady(): Promise<{ isLoaded: boolean }>;
  presentSignIn(): Promise<ClerkNativeSignInResult>;
}

const NativeClerkAuth = registerPlugin<ClerkNativeAuthPlugin>('ClerkNativeAuth');

const UNAVAILABLE_STATE: ClerkNativeAuthState = {
  isSignedIn: false,
  userId: null,
  sessionId: null,
  isLoaded: false,
};

export async function getNativeAuthState(): Promise<ClerkNativeAuthState> {
  if (!Capacitor.isNativePlatform()) return UNAVAILABLE_STATE;
  return NativeClerkAuth.getAuthState();
}

export async function getNativeAuthToken(): Promise<ClerkNativeTokenResult> {
  if (!Capacitor.isNativePlatform()) return { token: null, expiresAt: null };
  return NativeClerkAuth.getToken();
}

export async function signOutNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  return NativeClerkAuth.signOut();
}

export async function isNativeClerkReady(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { isLoaded } = await NativeClerkAuth.isReady();
  return isLoaded;
}

// Stage D: presents ClerkKitUI's native sign-in sheet and resolves once it
// closes (signed in or cancelled). Not yet wired into any production auth
// path — see Stage D of the native Clerk migration.
export async function presentNativeSignIn(): Promise<ClerkNativeSignInResult> {
  if (!Capacitor.isNativePlatform()) {
    return { status: "failed", isSignedIn: false, userId: null };
  }
  return NativeClerkAuth.presentSignIn();
}
