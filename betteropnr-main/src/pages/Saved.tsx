import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ReminderBanner } from "@/components/ReminderBanner";
import { NotificationSetup } from "@/components/NotificationSetup";
import { useBetterOpnr } from "@/contexts/TalkSparkContext";
import { Heart, Copy, Share2, Trash2, Sparkles, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Saved = () => {
  const { favorites, removeFromFavorites, updateFavoriteReminderName } = useBetterOpnr();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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

  const handleStartEdit = (id: string, currentName?: string) => {
    setEditingId(id);
    setEditName(currentName || "");
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateFavoriteReminderName(id, editName.trim());
      toast.success('Reminder name updated');
    }
    setEditingId(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2 sm:space-y-3 bg-gradient-subtle rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary fill-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">Saved Favorites</h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
              Your collection of conversation starters that really work
            </p>
          </div>

          <ReminderBanner />

          <NotificationSetup />

          {favorites.length === 0 ? (
            <Card className="text-center py-12 sm:py-16 md:py-20 space-y-4 sm:space-y-5 md:space-y-6 mx-2 sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto bg-bo-gradient rounded-full flex items-center justify-center opacity-90">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
              </div>
              <div className="space-y-2 sm:space-y-3 px-3">
                <h3 className="text-xl sm:text-2xl font-heading font-semibold text-foreground">No favorites yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                  Start generating conversation starters and save the ones you love. They'll appear here for easy access.
                </p>
              </div>
              <Button onClick={() => window.location.href = '/'} size="default" className="text-sm sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Generate Your First Opener
              </Button>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {favorites.map((opener) => (
                <Card key={opener.id} className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 hover:shadow-elegant transition-all duration-300 border border-border/50">
                  {opener.remindAt && (
                    <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                      {editingId === opener.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Enter reminder name..."
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSaveEdit(opener.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <Badge variant="outline" className="text-xs">
                            Reminder: {opener.customReminderName || opener.matchName || 'Follow up'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(opener.id, opener.customReminderName || opener.matchName)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <p className="text-sm sm:text-base leading-relaxed flex-1">{opener.text}</p>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {opener.tone}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(opener.text)}
                      className="flex-1 min-w-[100px] text-xs sm:text-sm"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Copy
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(opener.text)}
                      className="flex-1 min-w-[100px] text-xs sm:text-sm"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(opener.id)}
                      className="min-w-[80px] text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
