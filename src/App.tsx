import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ClerkProvider,
  useUser,
  AuthenticateWithRedirectCallback,
} from "@clerk/clerk-react";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { AuthModeSync } from "@/components/auth/AuthModeSync";
import { RequireAuthOrGuest } from "@/components/auth/RequireAuthOrGuest";
import { HomeOrGenerator } from "@/components/HomeOrGenerator";
import { ClerkSyncProvider } from "@/contexts/ClerkSyncContext";
import { BetterOpnrProvider } from "@/contexts/TalkSparkContext";
import { Navigation } from "@/components/Navigation";
import { InstallBanner } from "@/components/InstallBanner";
import { isWebApp, isNativeApp } from "@/lib/platformDetection";
import { RevenueCatAuthBridge } from "@/components/RevenueCatAuthBridge";
import Generator from "./pages/Generator";
import Saved from "./pages/Saved";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Billing from "./pages/Billing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BrandPreview from "./pages/BrandPreview";
import Install from "./pages/Install";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AffiliateDisclosure from "./pages/AffiliateDisclosure";
import NotFound from "./pages/NotFound";
import ProfileReview from "./pages/ProfileReview";
import AuthCallback from "./pages/AuthCallback";
import Footer from "@/components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/lib/motionConfig";
import { useState, useEffect } from "react";
import { AIConsentScreen } from "@/components/AIConsentScreen";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const CLERK_JS_URL =
  import.meta.env.VITE_CLERK_JS_URL ??
  `https://${
    import.meta.env.VITE_CLERK_DOMAIN ?? "clerk.betteropnr.com"
  }/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setAuthTimeout(true);
        if (import.meta.env.DEV) {
          console.warn(
            "⚠️ Auth timeout: Clerk did not load within 10 seconds. Check that this domain is authorized in your Clerk dashboard.",
          );
        }
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (authTimeout) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-subtle px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="text-destructive text-5xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Authentication Timeout
            </h2>
            <p className="text-muted-foreground">
              We're having trouble loading your account. This can happen if the
              app is running on a domain that isn't authorized in your sign-in
              settings.
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/sign-in")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">
            Loading your account…
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div {...pageTransition}>
              <HomeOrGenerator />
            </motion.div>
          }
        />
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        <Route
          path="/sso-callback"
          element={<AuthenticateWithRedirectCallback />}
        />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/brand-preview" element={<BrandPreview />} />
        <Route path="/install" element={<Install />} />
        <Route
          path="/privacy"
          element={
            <motion.div {...pageTransition}>
              <Privacy />
            </motion.div>
          }
        />
        <Route
          path="/terms"
          element={
            <motion.div {...pageTransition}>
              <Terms />
            </motion.div>
          }
        />
        <Route
          path="/affiliate-disclosure"
          element={
            <motion.div {...pageTransition}>
              <AffiliateDisclosure />
            </motion.div>
          }
        />

        <Route
          path="/generator"
          element={
            <RequireAuthOrGuest>
              <Generator />
            </RequireAuthOrGuest>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <motion.div {...pageTransition}>
                <Dashboard />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <motion.div {...pageTransition}>
                <Saved />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <motion.div {...pageTransition}>
                <Statistics />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <motion.div {...pageTransition}>
                <Billing />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-review"
          element={
            <ProtectedRoute>
              <motion.div {...pageTransition}>
                <ProfileReview />
              </motion.div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

// Logs Clerk load state and surfaces the actual FAPI error when Clerk fails.
// Must be rendered inside ClerkProvider so useUser() is available.
const ClerkLoadMonitor = () => {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    console.log(`[Clerk:state] isLoaded=${isLoaded} isSignedIn=${isSignedIn}`);
    if (!isLoaded) {
      console.warn(
        "[Clerk:state] Clerk has not loaded — check FAPI probe above for CORS errors",
      );
    }
  }, [isLoaded, isSignedIn]);

  return null;
};

// Must live inside BrowserRouter so useNavigate is available,
// which Clerk v5 requires for routerPush/routerReplace.
const ClerkProviderWithRouter = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const routerPush = (to: string) => navigate(to);
  const routerReplace = (to: string) => navigate(to, { replace: true });

  if (isNativeApp()) {
    return (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        proxyUrl="https://vshitqqftdekgtjanyaa.supabase.co/functions/v1/clerk-proxy"
        standardBrowser={false}
        routerPush={routerPush}
        routerReplace={routerReplace}
        allowedRedirectProtocols={[
          "app.lovable.betteropnr",
          "betteropnr",
          "capacitor",
        ]}
      >
        <ClerkLoadMonitor />
        {children}
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={routerPush}
      routerReplace={routerReplace}
    >
      {children}
    </ClerkProvider>
  );
};

const App = () => {
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem("betteropnr_ai_consent") === "true";
  });

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-subtle">
        <div className="max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            🔐 Missing Clerk Configuration
          </h1>
          <div className="bg-card p-6 rounded-2xl shadow-elegant space-y-4 text-left">
            <h2 className="text-xl font-semibold text-foreground">
              Setup Required:
            </h2>
            <p className="text-muted-foreground">
              The{" "}
              <code className="bg-muted px-2 py-1 rounded text-sm">
                VITE_CLERK_PUBLISHABLE_KEY
              </code>{" "}
              environment variable is not configured.
            </p>
            <ol className="space-y-3 list-decimal list-inside text-foreground">
              <li>
                Go to your{" "}
                <a
                  href="https://dashboard.clerk.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  Clerk Dashboard
                </a>
              </li>
              <li>
                Navigate to <strong>API Keys</strong>
              </li>
              <li>
                Copy your <strong>Publishable Key</strong> (starts with{" "}
                <code className="bg-muted px-1 rounded text-xs">pk_live_</code>{" "}
                or{" "}
                <code className="bg-muted px-1 rounded text-xs">pk_test_</code>)
              </li>
              <li>
                Add it to your{" "}
                <code className="bg-muted px-2 py-1 rounded text-sm">.env</code>{" "}
                file:
                <code className="block bg-muted p-3 rounded mt-2 text-sm font-mono">
                  VITE_CLERK_PUBLISHABLE_KEY="pk_live_..."
                </code>
              </li>
              <li>Restart your development server</li>
            </ol>
            <div className="mt-4 p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Use a production key (
                <code className="text-xs">pk_live_</code>) for real users. Test
                keys don't send actual emails.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasConsented) {
    return <AIConsentScreen onConsent={() => setHasConsented(true)} />;
  }

  return (
    <BrowserRouter>
      <ClerkProviderWithRouter>
        <SupabaseProvider>
          <ClerkSyncProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <BetterOpnrProvider>
                  <Toaster />
                  <Sonner />
                  <AuthModeSync />
                  <RevenueCatAuthBridge />
                  <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
                    <Navigation />
                    {isWebApp() && <InstallBanner />}
                    <main className="flex-1">
                      <AnimatedRoutes />
                    </main>
                    <Footer />
                  </div>
                </BetterOpnrProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </ClerkSyncProvider>
        </SupabaseProvider>
      </ClerkProviderWithRouter>
    </BrowserRouter>
  );
};

export default App;
