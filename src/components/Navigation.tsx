import { Link, useLocation } from "react-router-dom";
import { Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TalkSpark
            </h1>
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
