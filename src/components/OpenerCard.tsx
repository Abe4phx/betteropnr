import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, RefreshCw, Star, Shield, Smile, Laugh, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBetterOpnr } from "@/contexts/TalkSparkContext";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { useState } from "react";
import { motion } from "framer-motion";

interface OpenerCardProps {
  id: string;
  text: string;
  tone: string;
  onTryAgain?: () => void;
  onVariation?: (style: 'safer' | 'warmer' | 'funnier' | 'shorter') => void;
}

export const OpenerCard = ({ id, text, tone, onTryAgain, onVariation }: OpenerCardProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites, rateItem, getItemRating, selectedTones } = useBetterOpnr();
  const favorite = isFavorite(id);
  const currentRating = getItemRating(id);
  const [showReminderCheckbox, setShowReminderCheckbox] = useState(false);
  const [remindIn24h, setRemindIn24h] = useState(false);

  const handleFavoriteClick = () => {
    if (favorite) {
      removeFromFavorites(id);
      setShowReminderCheckbox(false);
      setRemindIn24h(false);
      toast.success('Removed from favorites');
    } else {
      addToFavorites({ id, text, tone }, 'opener', selectedTones, remindIn24h);
      trackEvent('saved_opener', { tone, reminder: remindIn24h });
      toast.success(remindIn24h ? 'Saved with 24h reminder!' : 'Added to favorites!');
      setShowReminderCheckbox(false);
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
    rateItem(id, rating);
    trackEvent('rated_item', { type: 'opener', rating });
    toast.success(`Rated ${rating} star${rating !== 1 ? 's' : ''}!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 border border-border/50">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base leading-relaxed flex-1">{text}</p>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
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
                    className={`w-4 h-4 transition-all ${
                      star <= currentRating
                        ? 'fill-secondary text-secondary'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Variation buttons */}
        {onVariation && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVariation('safer')}
              className="rounded-xl text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Safer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVariation('warmer')}
              className="rounded-xl text-xs"
            >
              <Smile className="w-3 h-3 mr-1" />
              Warmer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVariation('funnier')}
              className="rounded-xl text-xs"
            >
              <Laugh className="w-3 h-3 mr-1" />
              Funnier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVariation('shorter')}
              className="rounded-xl text-xs"
            >
              <Minimize2 className="w-3 h-3 mr-1" />
              Shorter
            </Button>
          </div>
        )}

      {!favorite && (
        <div className="flex items-center space-x-2 pl-1">
          <Checkbox 
            id={`remind-${id}`}
            checked={remindIn24h}
            onCheckedChange={(checked) => setRemindIn24h(checked as boolean)}
          />
          <Label 
            htmlFor={`remind-${id}`}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Remind me in 24h to follow up
          </Label>
        </div>
      )}
      
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
    </motion.div>
  );
};
