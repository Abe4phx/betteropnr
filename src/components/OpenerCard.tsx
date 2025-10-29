import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTalkSpark } from "@/contexts/TalkSparkContext";
import { toast } from "sonner";

interface OpenerCardProps {
  id: string;
  text: string;
  tone: string;
  onTryAgain?: () => void;
}

export const OpenerCard = ({ id, text, tone, onTryAgain }: OpenerCardProps) => {
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card className="p-5 space-y-4 hover:shadow-lg transition-all duration-200 rounded-2xl border-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base leading-relaxed flex-1">{text}</p>
        <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1">
          {tone}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 rounded-xl"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>
        
        <Button
          variant={favorite ? "default" : "outline"}
          size="sm"
          onClick={handleFavoriteClick}
          className="flex-1 rounded-xl"
        >
          <Heart className={`w-4 h-4 mr-2 ${favorite ? 'fill-current' : ''}`} />
          {favorite ? 'Saved' : 'Save'}
        </Button>
        
        {onTryAgain && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTryAgain}
            className="flex-1 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
};
