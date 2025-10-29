import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTalkSpark } from "@/contexts/TalkSparkContext";
import { toast } from "sonner";

interface OpenerCardProps {
  id: string;
  text: string;
  tone: string;
  onGenerateFollowUp?: () => void;
}

export const OpenerCard = ({ id, text, tone, onGenerateFollowUp }: OpenerCardProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useTalkSpark();
  const favorite = isFavorite(id);

  const handleFavoriteClick = () => {
    if (favorite) {
      removeFromFavorites(id);
      toast.success('Removed from favorites');
    } else {
      addToFavorites({ id, text, tone });
      toast.success('Added to favorites!');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base flex-1">{text}</p>
        <Badge variant="secondary" className="shrink-0">
          {tone}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavoriteClick}
          className="flex-1"
        >
          <Heart className={`w-4 h-4 mr-2 ${favorite ? 'fill-primary' : ''}`} />
          {favorite ? 'Saved' : 'Save'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        
        {onGenerateFollowUp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onGenerateFollowUp}
            className="flex-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Follow-up
          </Button>
        )}
      </div>
    </Card>
  );
};
