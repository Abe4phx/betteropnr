import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { isGuest } from "@/lib/guest";

const TONES = [
  { id: 'playful', label: 'Playful', emoji: '🎉' },
  { id: 'sincere', label: 'Sincere', emoji: '💛' },
  { id: 'confident', label: 'Confident', emoji: '💪' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
];

const GUEST_ALLOWED_TONES = ['playful', 'sincere'];

interface TonePickerProps {
  selectedTones: string[];
  onChange: (tones: string[]) => void;
}

export const TonePicker = ({ selectedTones, onChange }: TonePickerProps) => {
  const { isSignedIn } = useAuth();
  const guestMode = !isSignedIn && isGuest();

  // Force-reset invalid tones for guests
  useEffect(() => {
    if (!guestMode) return;
    const valid = selectedTones.filter(t => GUEST_ALLOWED_TONES.includes(t));
    if (valid.length !== selectedTones.length) {
      onChange(valid.length > 0 ? valid : ['playful']);
    }
  }, [guestMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTone = (toneId: string) => {
    if (guestMode && !GUEST_ALLOWED_TONES.includes(toneId)) return;
    if (selectedTones.includes(toneId)) {
      onChange(selectedTones.filter(t => t !== toneId));
    } else {
      onChange([...selectedTones, toneId]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-lg font-semibold text-foreground">Choose your tone</Label>
      <div className="flex flex-wrap gap-3">
        {TONES.map((tone) => {
          const isDisabled = guestMode && !GUEST_ALLOWED_TONES.includes(tone.id);
          return (
            <Badge
              key={tone.id}
              variant={selectedTones.includes(tone.id) ? "default" : "outline"}
              className={`px-6 py-3 text-base rounded-full transition-all shadow-sm ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:scale-105 hover:shadow-md'
              }`}
              onClick={() => toggleTone(tone.id)}
              title={isDisabled ? 'Sign in to unlock all tones.' : undefined}
            >
              <span className="mr-2 text-lg">{tone.emoji}</span>
              {tone.label}
              {isDisabled && <Lock className="w-3.5 h-3.5 ml-1.5 text-muted-foreground" />}
            </Badge>
          );
        })}
      </div>
      {guestMode && (
        <p className="text-xs text-muted-foreground">
          <Lock className="w-3 h-3 inline mr-1 -mt-0.5" />
          Sign in to unlock all tones.
        </p>
      )}
    </div>
  );
};
