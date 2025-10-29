import { OpenerCard } from "./OpenerCard";
import { Opener } from "@/contexts/TalkSparkContext";

interface OpenerListProps {
  openers: Opener[];
  onGenerateFollowUp?: (openerId: string) => void;
}

export const OpenerList = ({ openers, onGenerateFollowUp }: OpenerListProps) => {
  if (openers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-heading font-bold">Generated Openers</h3>
      <div className="space-y-3">
        {openers.map((opener) => (
          <OpenerCard
            key={opener.id}
            {...opener}
            onGenerateFollowUp={onGenerateFollowUp ? () => onGenerateFollowUp(opener.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
