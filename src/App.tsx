import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { BetterOpnrProvider } from "@/contexts/TalkSparkContext";
import { Navigation } from "@/components/Navigation";
import { InstallBanner } from "@/components/InstallBanner";
import { isWebApp } from "@/lib/platformDetection";
import Generator from "./pages/Generator";
import Saved from "./pages/Saved";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BrandPreview from "./pages/BrandPreview";
import Install from "./pages/Install";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Footer from "@/components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/lib/motionConfig";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        <Route path="/brand-preview" element={<BrandPreview />} />
        <Route path="/install" element={<Install />} />
        <Route path="/privacy" element={
          <motion.div {...pageTransition}>
            <Privacy />
          </motion.div>
        } />
        
        {/* Protected routes with page transitions */}
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <motion.div {...pageTransition}>
                  <Generator />
                </motion.div>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <motion.div {...pageTransition}>
                  <Dashboard />
                </motion.div>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/saved"
          element={
            <>
              <SignedIn>
                <motion.div {...pageTransition}>
                  <Saved />
                </motion.div>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/billing"
          element={
            <>
              <SignedIn>
                <motion.div {...pageTransition}>
                  <Billing />
                </motion.div>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // Show setup instructions if no valid key is configured
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-subtle">
        <div className="max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">🔐 Missing Clerk Configuration</h1>
          <div className="bg-card p-6 rounded-2xl shadow-elegant space-y-4 text-left">
            <h2 className="text-xl font-semibold text-foreground">Setup Required:</h2>
            <p className="text-muted-foreground">
              The <code className="bg-muted px-2 py-1 rounded text-sm">VITE_CLERK_PUBLISHABLE_KEY</code> environment variable is not configured.
            </p>
            <ol className="space-y-3 list-decimal list-inside text-foreground">
              <li>Go to your <a href="https://dashboard.clerk.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Clerk Dashboard</a></li>
              <li>Navigate to <strong>API Keys</strong></li>
              <li>Copy your <strong>Publishable Key</strong> (starts with <code className="bg-muted px-1 rounded text-xs">pk_live_</code> or <code className="bg-muted px-1 rounded text-xs">pk_test_</code>)</li>
              <li>Add it to your <code className="bg-muted px-2 py-1 rounded text-sm">.env</code> file:
                <code className="block bg-muted p-3 rounded mt-2 text-sm font-mono">
                  VITE_CLERK_PUBLISHABLE_KEY="pk_live_..."
                </code>
              </li>
              <li>Restart your development server</li>
            </ol>
            <div className="mt-4 p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Use a production key (<code className="text-xs">pk_live_</code>) for real users. Test keys don't send actual emails.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BetterOpnrProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
              <Navigation />
              {isWebApp() && <InstallBanner />}
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </BetterOpnrProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
  );
};

export default App;
