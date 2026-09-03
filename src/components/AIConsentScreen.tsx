import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { enterGuest } from '@/lib/guest';
import { isNativeApp, getPlatform } from '@/lib/platformDetection';
import { getNativeAuthState } from '@/lib/clerkNativeAuth';

interface AIConsentScreenProps {
  onConsent: () => void;
}

export const AIConsentScreen = ({ onConsent }: AIConsentScreenProps) => {
  const [agreed, setAgreed] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    console.log('[AIConsent] mounted');
  }, []);

  const accept = async () => {
    if (accepted) return;
    setAccepted(true);
    localStorage.setItem('betteropnr_ai_consent', 'true');
    localStorage.setItem('betteropnr_ai_consent_completed_at', String(Date.now()));
    console.log('[AIConsent] saved consent');
    if (isNativeApp() && getPlatform() === 'ios') {
      // STAGE_E2: this screen renders before ClerkProvider mounts, so it
      // can't use useNativeAwareAuth() — it checks the native bridge
      // directly. Consent completion must not blindly enter guest mode if
      // ClerkKit already has a valid restored native session; downstream
      // (HomeOrGenerator/RequireAuthOrGuest) still reconciles this once
      // native auth fully resolves, so this is a best-effort early check.
      console.log('[AIConsent] checking native auth state before guest fallback');
      const nativeState = await getNativeAuthState();
      if (nativeState.isSignedIn) {
        console.log('[AIConsent] native session already present — skipping guest mode');
      } else {
        console.log('[AIConsent] no native session — entering guest mode');
        enterGuest();
      }
    }
    onConsent();
    console.log('[AIConsent] onConsent called');
  };

  const handleCheckboxChange = (checked: boolean) => {
    console.log('[AIConsent] checkbox changed', checked);
    setAgreed(checked);
    if (checked) {
      console.log('[AIConsent] auto-accept from checkbox');
      accept();
    }
  };

  const handleContinue = () => {
    console.log('[AIConsent] continue tapped');
    if (!agreed) return;
    accept();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg my-auto"
      >
        <Card className="flex flex-col p-6 sm:p-8" style={{ maxHeight: 'calc(100dvh - 2rem)' }}>
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto space-y-6 pb-4">
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
                  onCheckedChange={(checked) => handleCheckboxChange(checked === true)}
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
          </div>

          {/* Sticky button — always visible at bottom of card */}
          <div className="pt-4 border-t border-border/40">
            <Button
              onClick={handleContinue}
              disabled={!agreed}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
