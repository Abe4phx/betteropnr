import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpgradeSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeSuccessModal = ({ open, onOpenChange }: UpgradeSuccessModalProps) => {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (open && !hasTriggeredConfetti) {
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF6B6B', '#FFD166', '#00B8A9']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF6B6B', '#FFD166', '#00B8A9']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
      setHasTriggeredConfetti(true);
    }
  }, [open, hasTriggeredConfetti]);

  const features = [
    'Unlimited conversation openers',
    'Unlimited saved favorites',
    'All tones and variations',
    'Follow-up generation',
    'Priority support',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mx-auto mb-4 w-20 h-20 bg-bo-gradient rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <DialogTitle className="text-3xl font-heading font-bold text-center text-foreground">
            Welcome to Pro! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You now have unlimited access to create amazing conversations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full bg-bo-gradient"
            size="lg"
          >
            Start Creating Amazing Openers
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
