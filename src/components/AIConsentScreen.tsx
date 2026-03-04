import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AIConsentScreenProps {
  onConsent: () => void;
}

export const AIConsentScreen = ({ onConsent }: AIConsentScreenProps) => {
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (agreed) {
      localStorage.setItem('betteropnr_ai_consent', 'true');
      onConsent();
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center">
              How BetterOpnr Uses AI
            </h1>
            
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                BetterOpnr uses AI to generate message and profile suggestions based on what you provide.
              </p>
              <p>
                AI suggestions may be inaccurate or inappropriate. Please review and edit suggestions before using them.
              </p>
              <p>
                BetterOpnr does not send messages for you. You decide what to copy and share, and you are responsible for the content you send.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="ai-consent"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="ai-consent"
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                I understand and agree to use AI-generated suggestions responsibly.
              </Label>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!agreed}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};
