import { OpenerCard } from "./OpenerCard";
import { LockedOpenerCard } from "./LockedOpenerCard";
import { Opener } from "@/contexts/TalkSparkContext";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motionConfig";

interface OpenerListProps {
  openers: Opener[];
  matchName?: string;
  lockedSlots?: number;
  onTryAgain?: (openerId: string) => void;
  onVariation?: (openerId: string, style: 'safer' | 'warmer' | 'funnier' | 'shorter') => void;
  onShowPaywall?: () => void;
}

export const OpenerList = ({ openers, matchName, lockedSlots = 0, onTryAgain, onVariation, onShowPaywall }: OpenerListProps) => {
  if (openers.length === 0 && lockedSlots === 0) {
    return null;
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Your Openers
      </h3>
      <div className="space-y-4">
        {openers.map((opener) => (
          <OpenerCard
            key={opener.id}
            {...opener}
            matchName={matchName}
            onTryAgain={onTryAgain ? () => onTryAgain(opener.id) : undefined}
            onVariation={onVariation ? (style) => onVariation(opener.id, style) : undefined}
            onShowPaywall={onShowPaywall}
          />
        ))}
        {Array.from({ length: lockedSlots }).map((_, i) => (
          <LockedOpenerCard key={`locked-${i}`} index={openers.length + i + 1} />
        ))}
      </div>
    </motion.div>
  );
};
