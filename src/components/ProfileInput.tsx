import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProfileInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProfileInput = ({ value, onChange }: ProfileInputProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="profile" className="text-lg font-semibold">
        Tell us about them
      </Label>
      <Textarea
        id="profile"
        placeholder="Paste their bio, prompts, or interests..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] resize-none text-base rounded-2xl shadow-sm focus:shadow-md transition-shadow"
      />
      <p className="text-sm text-muted-foreground">
        The more details you provide, the better the conversation starters!
      </p>
    </div>
  );
};
