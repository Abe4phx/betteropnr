import { Link, useLocation } from "react-router-dom";
import { Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold">TalkSpark</h1>
          </Link>

          <div className="flex gap-2">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              asChild
            >
              <Link to="/">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </Link>
            </Button>
            <Button
              variant={location.pathname === "/saved" ? "default" : "ghost"}
              asChild
            >
              <Link to="/saved">
                <Heart className="w-4 h-4 mr-2" />
                Saved
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
