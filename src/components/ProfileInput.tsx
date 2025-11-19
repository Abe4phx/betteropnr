import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";
import { useImageTextExtraction } from "@/hooks/useImageTextExtraction";
import { useRef } from "react";

interface ProfileInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProfileInput = ({ value, onChange }: ProfileInputProps) => {
  const { isExtracting, imagePreviews, extractMultipleTexts, clearPreviews, removePreview } = useImageTextExtraction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const extractedText = await extractMultipleTexts(fileArray);
      onChange(extractedText);
    } catch (error) {
      // Error handling is done in the hook
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    clearPreviews();
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="profile" className="text-lg font-semibold">
          Tell us about them
        </Label>
        <div className="flex gap-2">
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
                Upload (2-5)
              </>
            )}
          </Button>
          {(imagePreviews.length > 0 || value) && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={isExtracting}
            >
              Clear All
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
      </div>

      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative inline-block">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg border-2 border-border"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 bg-background/80 text-xs px-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <Textarea
        id="profile"
        placeholder="Paste their bio, prompts, or interests..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={3000}
        className="min-h-[120px] resize-none text-base rounded-2xl shadow-sm focus:shadow-md transition-shadow"
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Upload 2-5 screenshots for profiles with multiple sections (like Hinge). Text will be extracted and combined.
        </p>
        <p className="text-sm text-muted-foreground">
          {value.length}/3000
        </p>
      </div>
    </div>
  );
};
