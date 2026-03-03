import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { exitGuest } from "@/lib/guest";

interface GuestPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function GuestPromptModal({
  open,
  onOpenChange,
  title = "Create an account to save",
  description = "Guest mode lets you generate openers. Sign in to save and sync across devices.",
}: GuestPromptModalProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    exitGuest();
    onOpenChange(false);
    navigate("/sign-in");
  };

  const handleCreateAccount = () => {
    exitGuest();
    onOpenChange(false);
    navigate("/sign-up");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleCreateAccount} className="rounded-xl">
            Create account
          </Button>
          <Button variant="outline" onClick={handleSignIn} className="rounded-xl">
            Sign in
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
