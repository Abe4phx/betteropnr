import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton, useUser, useClerk } from "@clerk/clerk-react";
import Logo from "@/components/Logo";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useClerkSync } from "@/hooks/useClerkSync";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { plan } = useUserPlan();
  
  // Sync user with Supabase
  useClerkSync();

  const handleSignOut = async () => {
    // Clear localStorage cache
    localStorage.clear();
    await signOut();
    navigate('/sign-in');
  };

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group">
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            {isLoaded && user ? (
              <>
                <Button
                  variant={location.pathname === "/saved" ? "default" : "outline"}
                  asChild
                  className="rounded-xl shadow-sm"
                >
                  <Link to="/saved">
                    <Heart className="w-4 h-4 mr-2" />
                    Saved
                  </Link>
                </Button>

                {plan === 'free' && (
                  <Button
                    variant="default"
                    className="rounded-xl shadow-sm bg-gradient-to-r from-primary to-primary-glow"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-sm text-right">
                    <div className="font-medium">{user.username || user.firstName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{plan} Plan</div>
                  </div>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10',
                      },
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="rounded-xl"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="default"
                asChild
                className="rounded-xl shadow-sm"
              >
                <Link to="/sign-in">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
