import { Card } from "@/components/ui/card";
import { FollowUp } from "@/contexts/TalkSparkContext";
import { MessageSquare } from "lucide-react";

interface FollowUpListProps {
  followUps: FollowUp[];
  openerId: string;
}

export const FollowUpList = ({ followUps, openerId }: FollowUpListProps) => {
  const relevantFollowUps = followUps.filter(f => f.openerId === openerId);

  if (relevantFollowUps.length === 0) {
    return null;
  }

  return (
    <div className="ml-6 mt-2 space-y-2">
      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4" />
        Follow-up ideas:
      </p>
      {relevantFollowUps.map((followUp) => (
        <Card key={followUp.id} className="p-3 bg-muted/50">
          <p className="text-sm">{followUp.text}</p>
        </Card>
      ))}
    </div>
  );
};
