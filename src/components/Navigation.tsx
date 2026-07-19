import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Zap, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton, useClerk } from "@clerk/clerk-react";
import { useNativeAwareAuth } from "@/hooks/useNativeAwareAuth";
import Logo from "@/components/Logo";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PaywallModal } from "@/components/PaywallModal";
import { motion } from "framer-motion";
import { isGuest } from "@/lib/guest";
import { intentionalNavigateToSignIn } from "@/lib/signInIntent";
import { isNativeApp } from "@/lib/platformDetection";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isLoaded,
    isSignedIn,
    isNativeAuthenticated,
    firstName,
    username,
  } = useNativeAwareAuth();
  const { signOut } = useClerk();
  const isAuthed = Boolean(
    (isLoaded && user) || isNativeAuthenticated || isSignedIn,
  );
  const guestMode = isGuest();
  const nativeGuestMode = isNativeApp() && guestMode;
  const displayName =
    user?.username || user?.firstName || username || firstName || "Account";
  const { plan } = useUserPlan();
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const handleSignOut = async () => {
    if (nativeGuestMode) return;

    localStorage.removeItem("betteropnr_native_supabase_token");
    localStorage.removeItem("betteropnr_native_session_token");
    localStorage.removeItem("betteropnr_guest_mode");

    try {
      await signOut();
    } catch (error) {
      console.warn("Clerk signOut skipped/failed:", error);
    }

    console.error("[Navigation] Sign Out clicked", {
      pathname: window.location.pathname,
      stack: new Error().stack,
    });
    intentionalNavigateToSignIn(navigate, {
      source: "navigation_sign_out",
      replace: true,
    });
    window.location.reload();
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm w-full overflow-x-hidden pt-safe-top"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link
            to={isAuthed || guestMode ? "/generator" : "/"}
            className="group"
          >
            <Logo />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthed ? (
              <>
                <Button
                  variant={
                    location.pathname === "/saved" ? "default" : "outline"
                  }
                  asChild
                  className="rounded-xl shadow-sm text-xs sm:text-sm"
                  size="sm"
                >
                  <Link to="/saved">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Saved</span>
                  </Link>
                </Button>

                <Button
                  variant={
                    location.pathname === "/profile-review"
                      ? "default"
                      : "outline"
                  }
                  asChild
                  className="rounded-xl shadow-sm text-xs sm:text-sm"
                  size="sm"
                >
                  <Link to="/profile-review">
                    <UserCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </Button>

                {plan === "free" && (
                  <Button
                    type="button"
                    variant="default"
                    className="bg-bo-gradient shadow-sm hover:shadow-md text-xs sm:text-sm"
                    size="sm"
                    onClick={() => setShowPaywallModal(true)}
                  >
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Upgrade</span>
                  </Button>
                )}

                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="hidden md:block text-sm text-right">
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {plan} Plan
                    </div>
                  </div>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                      },
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="rounded-xl w-8 h-8 sm:w-10 sm:h-10"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </>
            ) : nativeGuestMode ? null : (
              <Button
                type="button"
                variant="default"
                className="rounded-xl shadow-sm text-xs sm:text-sm"
                size="sm"
                onClick={() => {
                  if (nativeGuestMode) return;
                  console.error("[Navigation] Sign In clicked", {
                    pathname: window.location.pathname,
                    stack: new Error().stack,
                  });
                  intentionalNavigateToSignIn(navigate, {
                    source: "navigation_sign_in",
                  });
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      <PaywallModal
        open={showPaywallModal}
        onOpenChange={setShowPaywallModal}
      />
    </motion.nav>
  );
};
