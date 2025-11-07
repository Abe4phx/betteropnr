import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReminderBanner } from "@/components/ReminderBanner";
import { useBetterOpnr } from "@/contexts/TalkSparkContext";
import { Heart, Copy, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Saved = () => {
  const { favorites, removeFromFavorites } = useBetterOpnr();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async (text: string) => {
    const shareText = `"${text}"\n\n— Generated with BetterOpnr 💬✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy(shareText);
        }
      }
    } else {
      handleCopy(shareText);
    }
  };

  const handleDelete = (id: string) => {
    removeFromFavorites(id);
    toast.success('Removed from favorites');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h2 className="text-4xl font-heading font-bold">Saved Favorites</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Your collection of favorite conversation starters
          </p>
        </div>

        <ReminderBanner />

        {favorites.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No favorites yet</h3>
              <p className="text-muted-foreground">
                Start generating conversation starters and save your favorites!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((opener) => (
              <Card key={opener.id} className="p-5 space-y-4 hover:shadow-lg transition-all duration-200 rounded-2xl border-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base leading-relaxed flex-1">{opener.text}</p>
                  <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1">
                    {opener.tone}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(opener.text)}
                    className="flex-1 rounded-xl"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(opener.text)}
                    className="flex-1 rounded-xl"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(opener.id)}
                    className="flex-1 rounded-xl text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
