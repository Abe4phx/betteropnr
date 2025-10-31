import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, ChevronDown } from "lucide-react";

interface UserProfileInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserProfileInput = ({ value, onChange }: UserProfileInputProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open if empty, stay collapsed if filled
  useEffect(() => {
    setIsOpen(!value.trim());
  }, []);

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
        <Textarea
          id="userProfile"
          placeholder="Your interests, hobbies, favorites... (e.g., 'Love hiking, coffee enthusiast, watch sci-fi, play guitar')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px] resize-none text-base rounded-2xl shadow-sm focus:shadow-md transition-shadow"
        />
        <p className="text-sm text-muted-foreground">
          This helps find common ground and makes conversations more natural! Your profile is automatically saved.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
};
