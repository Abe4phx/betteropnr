import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProfileInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProfileInput = ({ value, onChange }: ProfileInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="profile" className="text-lg font-semibold">
        Tell us about yourself or the person you're chatting with
      </Label>
      <Textarea
        id="profile"
        placeholder="E.g., loves hiking, works as a teacher, recently traveled to Japan..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] resize-none text-base"
      />
      <p className="text-sm text-muted-foreground">
        The more details you provide, the better the conversation starters!
      </p>
    </div>
  );
};
