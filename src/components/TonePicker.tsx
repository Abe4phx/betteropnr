import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const TONES = [
  { id: 'playful', label: 'Playful', emoji: '🎉' },
  { id: 'sincere', label: 'Sincere', emoji: '💛' },
  { id: 'confident', label: 'Confident', emoji: '💪' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
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
      <div className="flex flex-wrap gap-3">
        {TONES.map((tone) => (
          <Badge
            key={tone.id}
            variant={selectedTones.includes(tone.id) ? "default" : "outline"}
            className="cursor-pointer px-5 py-2.5 text-base rounded-full transition-all hover:scale-105 shadow-sm hover:shadow-md"
            onClick={() => toggleTone(tone.id)}
          >
            <span className="mr-2">{tone.emoji}</span>
            {tone.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};
