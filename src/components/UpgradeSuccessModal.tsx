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
          colors: ['#a855f7', '#ec4899', '#8b5cf6']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a855f7', '#ec4899', '#8b5cf6']
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Unlimited Sparks! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            You now have access to all premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full"
            size="lg"
          >
            Start Creating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
