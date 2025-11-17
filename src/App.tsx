import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { BetterOpnrProvider } from "@/contexts/TalkSparkContext";
import { Navigation } from "@/components/Navigation";
import { InstallBanner } from "@/components/InstallBanner";
import Generator from "./pages/Generator";
import Saved from "./pages/Saved";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BrandPreview from "./pages/BrandPreview";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/lib/motionConfig";

// TODO: Replace with your actual Clerk publishable key from https://dashboard.clerk.com/
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_cm9idXN0LXBpcmFuaGEtMzUuY2xlcmsuYWNjb3VudHMuZGV2JA';

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
  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY === 'pk_test_REPLACE_WITH_YOUR_KEY') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold">🔐 Clerk Setup Required</h1>
          <div className="bg-card p-6 rounded-2xl shadow-lg space-y-4 text-left">
            <h2 className="text-xl font-semibold">Setup Instructions:</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Go to <a href="https://dashboard.clerk.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Clerk Dashboard</a></li>
              <li>Create a new application (or select existing)</li>
              <li>Enable Email, Google, and Apple sign-in methods</li>
              <li>Copy your <strong>Publishable Key</strong> from API Keys page</li>
              <li>Update <code className="bg-muted px-2 py-1 rounded">src/App.tsx</code> line 18:<br/>
                <code className="block bg-muted p-2 rounded mt-2 text-sm">
                  const CLERK_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY_HERE';
                </code>
              </li>
            </ol>
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
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <InstallBanner />
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
            </div>
          </BrowserRouter>
        </BetterOpnrProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
  );
};

export default App;
