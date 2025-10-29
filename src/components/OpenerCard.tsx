import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, RefreshCw, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTalkSpark } from "@/contexts/TalkSparkContext";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface OpenerCardProps {
  id: string;
  text: string;
  tone: string;
  onTryAgain?: () => void;
}

export const OpenerCard = ({ id, text, tone, onTryAgain }: OpenerCardProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites, rateFavorite, favorites, selectedTones } = useTalkSpark();
  const favorite = isFavorite(id);
  const favoriteItem = favorites.find(f => f.id === id);
  const currentRating = favoriteItem?.likes || 0;

  const handleFavoriteClick = () => {
    if (favorite) {
      removeFromFavorites(id);
      toast.success('Removed from favorites');
    } else {
      addToFavorites({ id, text, tone }, 'opener', selectedTones);
      trackEvent('saved_opener', { tone });
      toast.success('Added to favorites!');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent('clicked_copy', { type: 'opener', tone });
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleRating = (rating: number) => {
    if (!favorite) {
      addToFavorites({ id, text, tone }, 'opener', selectedTones);
    }
    rateFavorite(id, rating);
    trackEvent('rated_item', { type: 'opener', rating });
    toast.success(`Rated ${rating} star${rating !== 1 ? 's' : ''}!`);
  };

  return (
    <Card className="p-5 space-y-4 hover:shadow-lg transition-all duration-200 rounded-2xl border-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base leading-relaxed flex-1">{text}</p>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {tone}
          </Badge>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="transition-colors hover:scale-110 transform"
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= currentRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
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
