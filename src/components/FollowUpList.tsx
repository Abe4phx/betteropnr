import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FollowUp, useBetterOpnr } from "@/contexts/TalkSparkContext";
import { MessageSquare, Copy, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { motion } from "framer-motion";

interface FollowUpListProps {
  followUps: FollowUp[];
  openerId: string;
}

export const FollowUpList = ({ followUps, openerId }: FollowUpListProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites, rateItem, getItemRating, selectedTones } = useBetterOpnr();
  const relevantFollowUps = followUps.filter(f => f.openerId === openerId);

  if (relevantFollowUps.length === 0) {
    return null;
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent('clicked_copy', { type: 'followup' });
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleFavoriteClick = (followUp: FollowUp) => {
    const favorite = isFavorite(followUp.id);
    if (favorite) {
      removeFromFavorites(followUp.id);
      toast.success('Removed from favorites');
    } else {
      addToFavorites(followUp, 'followup', selectedTones, false);
      trackEvent('saved_opener', { type: 'followup' });
      toast.success('Added to favorites!');
    }
  };

  const handleRating = (followUp: FollowUp, rating: number) => {
    rateItem(followUp.id, rating);
    trackEvent('rated_item', { type: 'followup', rating });
    toast.success(`Rated ${rating} star${rating !== 1 ? 's' : ''}!`);
  };

  return (
    <div className="ml-8 mt-3 space-y-3">
      <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Follow-up ideas:
      </p>
      {relevantFollowUps.map((followUp) => {
        const favorite = isFavorite(followUp.id);
        const currentRating = getItemRating(followUp.id);

        return (
          <motion.div
            key={followUp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-relaxed flex-1">{followUp.text}</p>
              <div className="flex gap-1 shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(followUp, star)}
                    className="transition-colors hover:scale-110 transform"
                  >
                    <Star
                      className={`w-3 h-3 ${
                        star <= currentRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(followUp.text)}
                className="flex-1 rounded-xl text-xs h-8"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button
                variant={favorite ? "default" : "outline"}
                size="sm"
                onClick={() => handleFavoriteClick(followUp)}
                className="flex-1 rounded-xl text-xs h-8"
              >
                <Heart className={`w-3 h-3 mr-1 ${favorite ? 'fill-current' : ''}`} />
                {favorite ? 'Saved' : 'Save'}
              </Button>
            </div>
          </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
