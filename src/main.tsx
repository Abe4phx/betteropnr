import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNotifications } from "@/lib/notifications";
import { SplashScreen } from '@capacitor/splash-screen';
import { isNativeApp } from '@/lib/platformDetection';
import { configureNativeStatusBar } from '@/lib/nativeStatusBar';
import {
  presentNativeSignIn,
  getNativeAuthState,
  getNativeAuthToken,
  signOutNative,
} from '@/lib/clerkNativeAuth';

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: any;
  }
}

// Initialize notification system
initializeNotifications();

// ─── /sign-in blocker ────────────────────────────────────────────────────────
// Blocks every known navigation mechanism targeting /sign-in while the user
// is in guest mode.  User-initiated flows must call intentionalNavigateToSignIn()
// (src/lib/signInIntent.ts) which calls exitGuest() first — that makes
// isGuest() return false here, so the navigation is allowed through naturally.
// No intent flag: if isGuest() is true, the navigation is always blocked.
(function blockSignInForGuests() {
  const SIGN_IN = '/sign-in';
  const T = '[signInBlocker]';
  const isGuest = () => localStorage.getItem('auth_mode') === 'guest';

  function traceSignIn(method: string, dest: string, blocked: boolean) {
    const fn = blocked ? console.error : console.log;
    fn(
      T + (blocked ? ' BLOCKED' : ' allowed') + ' ' + method + ' → ' + dest,
      '\n  isGuest():', isGuest(),
      '\n  current pathname:', window.location.pathname,
      '\n  stack:', new Error().stack,
    );
  }

  // ── history.pushState / replaceState ──────────────────────────────────────
  function wrapHistory(original: typeof history.pushState, method: string) {
    return function patchedHistory(
      this: typeof history,
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      const dest = url != null ? String(url) : '(no url)';
      if (dest.includes(SIGN_IN)) {
        if (isGuest()) {
          traceSignIn(method, dest, true);
          return; // block
        }
        traceSignIn(method, dest, false);
      }
      return original.call(this, data, unused, url);
    };
  }
  history.pushState    = wrapHistory(history.pushState,    'pushState');
  history.replaceState = wrapHistory(history.replaceState, 'replaceState');

  // ── location.assign ───────────────────────────────────────────────────────
  try {
    const origAssign = window.location.assign.bind(window.location);
    window.location.assign = function(url: string) {
      if (String(url).includes(SIGN_IN)) traceSignIn('location.assign', String(url), isGuest());
      return origAssign(url);
    };
  } catch (e) { /* not patchable in this environment */ }

  // ── location.replace ──────────────────────────────────────────────────────
  try {
    const origReplace = window.location.replace.bind(window.location);
    window.location.replace = function(url: string) {
      if (String(url).includes(SIGN_IN)) traceSignIn('location.replace', String(url), isGuest());
      return origReplace(url);
    };
  } catch (e) { /* not patchable in this environment */ }

  // ── location.href setter ──────────────────────────────────────────────────
  try {
    const hrefDesc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    if (hrefDesc?.set) {
      Object.defineProperty(Location.prototype, 'href', {
        get: hrefDesc.get,
        set(value: string) {
          if (String(value).includes(SIGN_IN)) traceSignIn('location.href=', String(value), isGuest());
          hrefDesc.set!.call(this, value);
        },
        configurable: true,
      });
    }
  } catch (e) { /* not patchable in this environment */ }
})();

// ─── STAGE D TEMPORARY DEBUG HOOK — remove after native sign-in validation ──
// Exposes the native Clerk sign-in flow (added in Stage D of the native
// Clerk migration) for manual testing via Safari Web Inspector's console.
// Not wired into any production UI.
//
// Capacitor ships a production Vite bundle to the WebView even for an Xcode
// Debug build, so import.meta.env.DEV is false there — it cannot gate this
// hook. Instead this is gated by an explicit temporary flag set only in the
// gitignored .env.local (VITE_ENABLE_CLERK_NATIVE_DEBUG=true), which must
// never be set in any committed env file or production build.
//
// Invoke from the console attached to the native WebView, e.g.:
//   await window.__clerkNativeDebug.presentSignIn()
declare global {
  interface Window {
    __clerkNativeDebug?: {
      presentSignIn: typeof presentNativeSignIn;
      getAuthState: typeof getNativeAuthState;
      // Deliberately narrower than getNativeAuthToken(): never resolves with
      // the raw token string, so a console-printed result can't leak it.
      getToken: () => Promise<{ hasToken: boolean; expiresAt: number | null }>;
      signOut: typeof signOutNative;
    };
  }
}
if (
  isNativeApp() &&
  import.meta.env.VITE_ENABLE_CLERK_NATIVE_DEBUG === "true"
) {
  window.__clerkNativeDebug = {
    presentSignIn: presentNativeSignIn,
    getAuthState: getNativeAuthState,
    getToken: async () => {
      const { token, expiresAt } = await getNativeAuthToken();
      return { hasToken: token != null, expiresAt };
    },
    signOut: signOutNative,
  };
  console.log(
    "[ClerkNativeDebug] Stage D debug hook ready — call window.__clerkNativeDebug.presentSignIn()",
  );
}
// ─── END STAGE D TEMPORARY DEBUG HOOK ───────────────────────────────────────

// Configure native status bar for iOS (prevents overlay on webview)
configureNativeStatusBar();

// Configure splash screen for native apps
if (isNativeApp()) {
  // Splash screen will auto-hide based on capacitor.config.ts settings
  // You can manually control it here if needed
  SplashScreen.show({
    showDuration: 2000,
    autoHide: true,
  });
}

// Register service worker for PWA (only on web, not in native Capacitor app)
if ("serviceWorker" in navigator && !window.Capacitor) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed, but app will still work
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
