import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="group">
            <Logo />
          </Link>

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
        </div>
      </div>
    </nav>
  );
};
