import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check, RefreshCw, Star, Shield, Smile, Laugh, Minimize2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBetterOpnr } from "@/contexts/TalkSparkContext";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cardVariants, heartPulse } from "@/lib/motionConfig";
import { useUserPlan } from "@/hooks/useUserPlan";

interface OpenerCardProps {
  id: string;
  text: string;
  tone: string;
  matchName?: string;
  onTryAgain?: () => void;
  onVariation?: (style: 'safer' | 'warmer' | 'funnier' | 'shorter') => void;
  onShowPaywall?: () => void;
}

export const OpenerCard = ({ id, text, tone, matchName, onTryAgain, onVariation, onShowPaywall }: OpenerCardProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites, rateItem, getItemRating, selectedTones, favorites } = useBetterOpnr();
  const { plan } = useUserPlan();
  const favorite = isFavorite(id);
  const currentRating = getItemRating(id);
  const [showReminderCheckbox, setShowReminderCheckbox] = useState(false);
  const [remindIn24h, setRemindIn24h] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const heartControls = useAnimation();

  // Calculate active reminders
  const activeReminders = favorites.filter(f => f.remindAt).length;
  const maxReminders = plan === 'free' ? 3 : 10;
  const remindersRemaining = Math.max(0, maxReminders - activeReminders);
  const isAtReminderLimit = activeReminders >= maxReminders;

  const handleFavoriteClick = () => {
    if (favorite) {
      removeFromFavorites(id);
      setShowReminderCheckbox(false);
      setRemindIn24h(false);
      toast.success('Removed from favorites');
    } else {
      addToFavorites({ id, text, tone }, 'opener', selectedTones, remindIn24h, matchName);
      trackEvent('saved_opener', { tone, reminder: remindIn24h });
      toast.success(remindIn24h ? 'Saved with 24h reminder!' : 'Added to favorites!');
      setShowReminderCheckbox(false);
      // Trigger heart pulse animation
      heartControls.start(heartPulse);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setJustCopied(true);
      trackEvent('clicked_copy', { type: 'opener', tone });
      toast.success('Copied to clipboard!');
      setTimeout(() => setJustCopied(false), 2000);
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
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <Card className="p-6 space-y-4 transition-all duration-300 border border-border/50">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 pl-1">
              <Checkbox 
                id={`remind-${id}`}
                checked={remindIn24h}
                disabled={isAtReminderLimit && !remindIn24h}
                onCheckedChange={(checked) => {
                  if (checked && isAtReminderLimit && plan === 'free') {
                    onShowPaywall?.();
                    toast.error('Reminder limit reached. Upgrade for more reminders!');
                  } else {
                    setRemindIn24h(checked as boolean);
                  }
                }}
              />
              <Label 
                htmlFor={`remind-${id}`}
                className={`text-sm cursor-pointer ${isAtReminderLimit && !remindIn24h ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}
              >
                Remind me in 24h to follow up{matchName ? ` with ${matchName}` : ''}
              </Label>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`font-medium ${isAtReminderLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {remindersRemaining}/{maxReminders}
              </span>
              {plan === 'free' && isAtReminderLimit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowPaywall}
                  className="h-6 px-2 text-xs rounded-lg"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Button
          variant="default"
          size="lg"
          onClick={handleCopy}
          className={`w-full rounded-2xl transition-all ${!justCopied ? 'animate-pulse-subtle' : ''}`}
        >
          {justCopied ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant={favorite ? "default" : "outline"}
            size="sm"
            onClick={handleFavoriteClick}
            className="flex-1 rounded-xl"
          >
            <motion.div animate={heartControls}>
              <Heart className={`w-4 h-4 mr-2 ${favorite ? 'fill-current' : ''}`} />
            </motion.div>
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
      </div>
    </Card>
    </motion.div>
  );
};
