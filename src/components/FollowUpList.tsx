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
    <div className="ml-8 mt-3 space-y-3">
      <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Follow-up ideas:
      </p>
      {relevantFollowUps.map((followUp) => (
        <Card key={followUp.id} className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border">
          <p className="text-sm leading-relaxed">{followUp.text}</p>
        </Card>
      ))}
    </div>
  );
};
