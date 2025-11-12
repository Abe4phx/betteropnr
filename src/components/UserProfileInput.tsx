import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, ChevronDown, Camera, X, Loader2 } from "lucide-react";
import { useImageTextExtraction } from "@/hooks/useImageTextExtraction";
import { useUserProfile } from "@/hooks/useUserProfile";

interface UserProfileInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserProfileInput = ({ value, onChange }: UserProfileInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isExtracting, imagePreview, extractText, clearPreview } = useImageTextExtraction();
  const { profileText, setProfileText, isLoading } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profile text from database to parent component
  useEffect(() => {
    if (!isLoading && profileText && !value) {
      onChange(profileText);
    }
  }, [isLoading, profileText, value, onChange]);

  // Save to database when value changes
  useEffect(() => {
    if (value !== profileText) {
      setProfileText(value);
    }
  }, [value, profileText, setProfileText]);

  // Auto-open if empty, stay collapsed if filled
  useEffect(() => {
    setIsOpen(!value.trim());
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extractedText = await extractText(file);
      onChange(value ? `${value}\n\n${extractedText}` : extractedText);
    } catch (error) {
      // Error handling is done in the hook
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearPreview = () => {
    clearPreview();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between gap-2 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <Label htmlFor="userProfile" className="text-lg font-semibold cursor-pointer">
              Your Profile {value.trim() && <span className="text-sm text-muted-foreground font-normal ml-2">✓ Saved</span>}
            </Label>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            className="gap-2"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Upload Screenshot
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg border-2 border-border"
            />
            <button
              onClick={handleClearPreview}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <Textarea
          id="userProfile"
          placeholder="Your interests, hobbies, favorites... (e.g., 'Love hiking, coffee enthusiast, watch sci-fi, play guitar')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={3000}
          className="min-h-[100px] resize-none text-base rounded-2xl shadow-sm focus:shadow-md transition-shadow"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This helps find common ground and makes conversations more natural! Upload a screenshot or type manually. {isLoading ? 'Loading...' : 'Changes are automatically saved.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {value.length}/3000
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
