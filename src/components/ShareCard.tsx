import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import { toast } from "sonner";

interface ShareCardProps {
  text: string;
  tone: string;
}

export const ShareCard = ({ text, tone }: ShareCardProps) => {
  const handleShare = async () => {
    const shareText = `"${text}"\n\n— Generated with TalkSpark 💬✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyShare(shareText);
        }
      }
    } else {
      handleCopyShare(shareText);
    }
  };

  const handleCopyShare = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-background rounded-3xl shadow-xl border-2">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <p className="text-lg font-medium leading-relaxed">{text}</p>
            <p className="text-sm text-muted-foreground">Tone: {tone}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <span className="font-heading">TalkSpark</span>
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleShare}
            className="rounded-xl shadow-md"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
};
