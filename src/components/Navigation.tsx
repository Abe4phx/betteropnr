import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Zap, LogOut, BarChart3, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton, useUser, useClerk } from "@clerk/clerk-react";
import Logo from "@/components/Logo";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PaywallModal } from "@/components/PaywallModal";
import { motion } from "framer-motion";
import { isGuest } from "@/lib/guest";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { plan } = useUserPlan();
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const handleSignOut = async () => {
    // Clear localStorage cache
    localStorage.clear();
    await signOut();
    navigate('/sign-in');
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
          <Link to={(isLoaded && user) || isGuest() ? "/generator" : "/"} className="group">
            <Logo />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoaded && user ? (
              <>
                <Button
                  variant={location.pathname === "/saved" ? "default" : "outline"}
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
                  variant={location.pathname === "/profile-review" ? "default" : "outline"}
                  asChild
                  className="rounded-xl shadow-sm text-xs sm:text-sm"
                  size="sm"
                >
                  <Link to="/profile-review">
                    <UserCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </Button>

                <Button
                  variant={location.pathname === "/statistics" ? "default" : "outline"}
                  asChild
                  className="rounded-xl shadow-sm text-xs sm:text-sm"
                  size="sm"
                >
                  <Link to="/statistics">
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Stats</span>
                  </Link>
                </Button>

                {plan === 'free' && (
                  <Button
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
                    <div className="font-medium">{user.username || user.firstName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{plan} Plan</div>
                  </div>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8 sm:w-10 sm:h-10',
                      },
                    }}
                  />
                  <Button
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
            ) : (
              <Button
                variant="default"
                asChild
                className="rounded-xl shadow-sm text-xs sm:text-sm"
                size="sm"
              >
                <Link to="/sign-in">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywallModal} onOpenChange={setShowPaywallModal} />
    </motion.nav>
  );
};
