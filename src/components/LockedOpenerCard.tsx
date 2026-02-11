import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/motionConfig";
import { useNavigate } from "react-router-dom";

export const LockedOpenerCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate">
      <Card className="p-6 space-y-4 border border-border/50 opacity-60 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
          <Lock className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Sign in to unlock more openers
          </p>
          <Button size="sm" onClick={() => navigate("/sign-up")}>
            Sign up free
          </Button>
        </div>

        {/* Placeholder content behind blur */}
        <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">
          AI-generated suggestion
        </p>
        <div className="h-16 rounded bg-muted animate-pulse" />
      </Card>
    </motion.div>
  );
};
