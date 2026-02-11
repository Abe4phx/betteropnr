import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cardVariants } from "@/lib/motionConfig";
import { useNavigate } from "react-router-dom";

export const LockedOpenerCard = ({ index = 3 }: { index?: number }) => {
  const navigate = useNavigate();

  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate">
      <Card className="p-6 border border-border/50 relative overflow-hidden min-h-[180px]">
        {/* Fake blurred content behind overlay */}
        <div className="space-y-3 select-none" aria-hidden>
          <p className="text-xs text-muted-foreground/40 uppercase tracking-wide">
            AI-generated suggestion
          </p>
          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded bg-muted-foreground/10" />
            <div className="h-4 w-3/5 rounded bg-muted-foreground/10" />
            <div className="h-4 w-2/3 rounded bg-muted-foreground/10" />
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <Lock className="w-7 h-7 text-muted-foreground mb-1" />
          <p className="text-base font-heading font-semibold text-foreground">
            Opener #{index} (Locked)
          </p>
          <Button size="sm" className="mt-1" onClick={() => navigate("/sign-up")}>
            Sign in to unlock
          </Button>
          <p className="text-xs text-muted-foreground">
            Get more openers + all tones
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
