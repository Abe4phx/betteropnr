import { OpenerCard } from "./OpenerCard";
import { Opener } from "@/contexts/TalkSparkContext";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motionConfig";

interface OpenerListProps {
  openers: Opener[];
  matchName?: string;
  onTryAgain?: (openerId: string) => void;
  onVariation?: (openerId: string, style: 'safer' | 'warmer' | 'funnier' | 'shorter') => void;
}

export const OpenerList = ({ openers, matchName, onTryAgain, onVariation }: OpenerListProps) => {
  if (openers.length === 0) {
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
          />
        ))}
      </div>
    </motion.div>
  );
};
