import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ShareCardProps {
  text: string;
  tones: string[];
}

export const ShareCard = ({ text, tones }: ShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'talkspark-opener.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Image saved!');
      });
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image');
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      if (navigator.share && navigator.canShare) {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
        });

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          const file = new File([blob], 'talkspark-opener.png', { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'TalkSpark Opener',
              text: 'Check out this conversation starter from TalkSpark!',
            });
            toast.success('Shared!');
          } else {
            // Fallback to text share
            await navigator.share({
              title: 'TalkSpark Opener',
              text: text,
            });
            toast.success('Shared!');
          }
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="relative p-8 rounded-3xl bg-gradient-to-br from-background to-muted/30"
        style={{
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, hsl(15, 90%, 65%), hsl(45, 100%, 60%)) 1',
          borderRadius: '24px',
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-lg font-semibold">Conversation Starter</h3>
          </div>
          
          <p className="text-xl leading-relaxed font-medium min-h-[80px] flex items-center">
            {text}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {tones.map((tone) => (
              <Badge 
                key={tone} 
                variant="secondary"
                className="rounded-full px-4 py-1.5 text-sm font-medium"
              >
                {tone}
              </Badge>
            ))}
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground font-medium opacity-60">
              TalkSpark
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSaveImage}
          variant="outline"
          className="flex-1 rounded-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Save Image
        </Button>
        
        <Button
          onClick={handleShare}
          className="flex-1 rounded-xl"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};
