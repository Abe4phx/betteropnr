import { OpenerCard } from "./OpenerCard";
import { Opener } from "@/contexts/TalkSparkContext";

interface OpenerListProps {
  openers: Opener[];
  onTryAgain?: (openerId: string) => void;
}

export const OpenerList = ({ openers, onTryAgain }: OpenerListProps) => {
  if (openers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Your Openers
      </h3>
      <div className="space-y-4">
        {openers.map((opener) => (
          <OpenerCard
            key={opener.id}
            {...opener}
            onTryAgain={onTryAgain ? () => onTryAgain(opener.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
