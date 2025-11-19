import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, Upload, GripVertical } from "lucide-react";
import { useImageTextExtraction } from "@/hooks/useImageTextExtraction";
import { useRef, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface ProfileInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProfileInput = ({ value, onChange }: ProfileInputProps) => {
  const { 
    isExtracting, 
    imagePreviews, 
    extractMultipleTexts, 
    clearPreviews, 
    removePreview, 
    reorderPreviews,
    getCombinedText,
  } = useImageTextExtraction();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Touch gesture state
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [touchCurrentIndex, setTouchCurrentIndex] = useState<number | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Drag and drop for file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: 'No images found',
        description: 'Please drop image files (JPG, PNG, or WEBP).',
        variant: 'destructive',
      });
      return;
    }

    if (imageFiles.length > 5) {
      toast({
        title: 'Too many images',
        description: 'Please upload a maximum of 5 images at once.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const extractedText = await extractMultipleTexts(imageFiles);
      onChange(extractedText);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Drag and drop for reordering
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    reorderPreviews(draggedIndex, index);
    setDraggedIndex(index);
    
    // Update the combined text after reordering
    const newText = getCombinedText();
    onChange(newText);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchStartIndex(index);
    setTouchCurrentIndex(index);
    
    // Start long-press timer (500ms)
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      toast({
        title: 'Reorder mode',
        description: 'Drag to reorder, release to confirm',
        duration: 2000,
      });
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!longPressActive || touchStartIndex === null) {
      // Cancel long-press if moved before activation
      if (longPressTimer.current && touchStartPos) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);
        
        // If moved more than 10px, cancel long-press
        if (deltaX > 10 || deltaY > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
      return;
    }

    e.preventDefault(); // Prevent scrolling while dragging
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the image preview element
    if (element) {
      const imageElement = element.closest('[data-image-index]');
      if (imageElement) {
        const newIndex = parseInt(imageElement.getAttribute('data-image-index') || '0');
        if (newIndex !== touchCurrentIndex && touchStartIndex !== null) {
          setTouchCurrentIndex(newIndex);
          reorderPreviews(touchStartIndex, newIndex);
          setTouchStartIndex(newIndex);
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (longPressActive && touchStartIndex !== null) {
      // Update the combined text after reordering
      const newText = getCombinedText();
      onChange(newText);
      
      toast({
        title: 'Order updated',
        description: 'Profile sections reordered successfully',
        duration: 2000,
      });
    }

    setLongPressActive(false);
    setTouchStartIndex(null);
    setTouchCurrentIndex(null);
    setTouchStartPos(null);
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressActive(false);
    setTouchStartIndex(null);
    setTouchCurrentIndex(null);
    setTouchStartPos(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

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

      {/* Drag and drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-6 transition-all duration-200
          ${isDraggingOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
          }
          ${isExtracting ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className={`w-8 h-8 ${isDraggingOver ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
          <p className="text-sm font-medium">
            {isDraggingOver ? 'Drop images here' : 'Drag & drop images or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            Upload 2-5 screenshots • JPG, PNG, or WEBP • Max 5MB each
          </p>
        </div>
      </div>

      {imagePreviews.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            <span className="hidden sm:inline">Drag to reorder profile sections</span>
            <span className="sm:hidden">Long-press and drag to reorder</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                data-image-index={index}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                className={`
                  relative inline-block group cursor-move touch-none
                  transition-all duration-200
                  ${draggedIndex === index || (longPressActive && touchStartIndex === index) 
                    ? 'opacity-50 scale-95' 
                    : 'hover:scale-105 active:scale-95'
                  }
                  ${longPressActive && touchCurrentIndex === index ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div className={`
                  absolute inset-0 bg-background/80 transition-opacity rounded-lg 
                  flex items-center justify-center pointer-events-none
                  ${longPressActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                `}>
                  <GripVertical className="w-6 h-6 text-foreground" />
                </div>
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className={`
                    h-24 w-24 object-cover rounded-lg border-2 transition-colors
                    ${longPressActive && touchCurrentIndex === index
                      ? 'border-primary'
                      : 'border-border group-hover:border-primary'
                    }
                  `}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(index);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 active:bg-destructive transition-colors z-10"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-semibold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
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
