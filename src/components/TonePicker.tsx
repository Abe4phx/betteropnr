import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const TONES = [
  { id: 'casual', label: 'Casual', emoji: '😊' },
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'flirty', label: 'Flirty', emoji: '😉' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
  { id: 'thoughtful', label: 'Thoughtful', emoji: '🤔' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
];

interface TonePickerProps {
  selectedTones: string[];
  onChange: (tones: string[]) => void;
}

export const TonePicker = ({ selectedTones, onChange }: TonePickerProps) => {
  const toggleTone = (toneId: string) => {
    if (selectedTones.includes(toneId)) {
      onChange(selectedTones.filter(t => t !== toneId));
    } else {
      onChange([...selectedTones, toneId]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-lg font-semibold">Choose your tone</Label>
      <div className="flex flex-wrap gap-2">
        {TONES.map((tone) => (
          <Badge
            key={tone.id}
            variant={selectedTones.includes(tone.id) ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
            onClick={() => toggleTone(tone.id)}
          >
            <span className="mr-1.5">{tone.emoji}</span>
            {tone.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};
