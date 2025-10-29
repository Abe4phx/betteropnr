import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface UserProfileInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserProfileInput = ({ value, onChange }: UserProfileInputProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        <Label htmlFor="userProfile" className="text-lg font-semibold">
          Tell us about yourself
        </Label>
      </div>
      <Textarea
        id="userProfile"
        placeholder="Your interests, hobbies, favorites... (e.g., 'Love hiking, coffee enthusiast, watch sci-fi, play guitar')"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] resize-none text-base rounded-2xl shadow-sm focus:shadow-md transition-shadow"
      />
      <p className="text-sm text-muted-foreground">
        This helps find common ground and makes conversations more natural!
      </p>
    </div>
  );
};
