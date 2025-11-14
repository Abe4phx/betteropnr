import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReminderBanner } from "@/components/ReminderBanner";
import { useBetterOpnr } from "@/contexts/TalkSparkContext";
import { Heart, Copy, Share2, Trash2, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-3 bg-gradient-subtle rounded-3xl p-8">
            <div className="flex items-center justify-center gap-3">
              <Heart className="w-10 h-10 text-primary fill-primary" />
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Saved Favorites</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Your collection of conversation starters that really work
            </p>
          </div>

          <ReminderBanner />

          {favorites.length === 0 ? (
            <Card className="text-center py-20 space-y-6">
              <div className="w-28 h-28 mx-auto bg-bo-gradient rounded-full flex items-center justify-center opacity-90">
                <Heart className="w-14 h-14 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-heading font-semibold text-foreground">No favorites yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start generating conversation starters and save the ones you love. They'll appear here for easy access.
                </p>
              </div>
              <Button onClick={() => window.location.href = '/'} size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Your First Opener
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.map((opener) => (
                <Card key={opener.id} className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 border border-border/50">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base leading-relaxed flex-1">{opener.text}</p>
                    <Badge variant="secondary" className="shrink-0">
                      {opener.tone}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(opener.text)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(opener.text)}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(opener.id)}
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
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
    </div>
  );
};

export default Saved;
