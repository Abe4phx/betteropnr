import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { TalkSparkProvider } from "@/contexts/TalkSparkContext";
import { Navigation } from "@/components/Navigation";
import Generator from "./pages/Generator";
import Saved from "./pages/Saved";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BrandPreview from "./pages/BrandPreview";
import NotFound from "./pages/NotFound";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TalkSparkProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/sign-in/*" element={<SignIn />} />
                  <Route path="/sign-up/*" element={<SignUp />} />
                  <Route path="/brand-preview" element={<BrandPreview />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <>
                        <SignedIn>
                          <Generator />
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
                          <Dashboard />
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
                          <Saved />
                        </SignedIn>
                        <SignedOut>
                          <Navigate to="/sign-in" replace />
                        </SignedOut>
                      </>
                    }
                  />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TalkSparkProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
