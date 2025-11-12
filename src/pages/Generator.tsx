import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { ProfileInput } from "@/components/ProfileInput";
import { UserProfileInput } from "@/components/UserProfileInput";
import { TonePicker } from "@/components/TonePicker";
import { OpenerList } from "@/components/OpenerList";
import { FollowUpList } from "@/components/FollowUpList";
import { ReminderBanner } from "@/components/ReminderBanner";
import { Button } from "@/components/ui/button";
import { useBetterOpnr } from "@/contexts/TalkSparkContext";
import { Opener } from "@/contexts/TalkSparkContext";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PaywallModal } from "@/components/PaywallModal";
import { UpgradeSuccessModal } from "@/components/UpgradeSuccessModal";
import { supabase } from "@/integrations/supabase/client";

const Generator = () => {
  const { user } = useUser();
  const {
    profileText,
    setProfileText,
    userProfileText,
    setUserProfileText,
    selectedTones,
    setSelectedTones,
    generatedOpeners,
    setGeneratedOpeners,
    followUps,
    setFollowUps,
  } = useBetterOpnr();

  const { plan } = useUserPlan();
  const { usage, loading: usageLoading, incrementOpeners } = useUsageTracking();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingFollowUpFor, setGeneratingFollowUpFor] = useState<string | null>(null);
  const [generatingVariationFor, setGeneratingVariationFor] = useState<string | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Check if user just completed checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessModal(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const generateOpeners = async (variationStyle?: 'safer' | 'warmer' | 'funnier' | 'shorter') => {
    if (!profileText.trim()) {
      toast.error('Please enter some profile information');
      return;
    }
    
    if (selectedTones.length === 0) {
      toast.error('Please select at least one tone');
      return;
    }

    // Check usage limits for free users
    if (plan === 'free' && usage.hasExceededOpenerLimit) {
      setShowPaywallModal(true);
      toast.error('Daily limit reached. Upgrade for unlimited openers!');
      return;
    }

    setIsGenerating(true);

    try {
      if (!user?.id) {
        toast.error('Please sign in to generate openers');
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate', {
        body: {
          profileText,
          userProfileText,
          tones: selectedTones,
          mode: 'opener',
          variationStyle,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('User not found')) {
          toast.error('Account setup incomplete. Please sign out and back in.');
          return;
        }
        
        if (error.message?.includes('Rate limit')) {
          toast.error('Too many requests. Please wait a moment.');
          return;
        }

        if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
          toast.error('Request timed out. Please try again.');
          return;
        }

        throw new Error(error.message || 'Failed to generate openers');
      }

      if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
        console.error('Invalid response from edge function:', data);
        toast.error('No openers generated. Please try again.');
        return;
      }

      const openers = data.results.map((text: string, index: number) => ({
        id: `opener-${Date.now()}-${index}`,
        text,
        tone: selectedTones[index % selectedTones.length].charAt(0).toUpperCase() + 
              selectedTones[index % selectedTones.length].slice(1),
      }));

      setGeneratedOpeners(openers);
      
      // Increment usage count
      await incrementOpeners();
      
      trackEvent('generated_opener', { 
        count: openers.length, 
        tones: selectedTones.join(',') 
      });
      toast.success('Openers generated!');
    } catch (error) {
      console.error('Error generating openers:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate openers. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariation = async (openerId: string, style: 'safer' | 'warmer' | 'funnier' | 'shorter') => {
    setGeneratingVariationFor(openerId);
    toast.info(`Generating ${style} variation...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate', {
        body: {
          profileText,
          userProfileText,
          tones: selectedTones,
          mode: 'opener',
          variationStyle: style,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate variation');
      }
      const newOpener: Opener = {
        id: `opener-${Date.now()}`,
        text: data.results[0],
        tone: selectedTones[0].charAt(0).toUpperCase() + selectedTones[0].slice(1),
      };

      // Replace the opener
      const updatedOpeners = generatedOpeners.map(o => o.id === openerId ? newOpener : o);
      setGeneratedOpeners(updatedOpeners);
      
      trackEvent('generated_variation', { style, originalId: openerId });
      toast.success(`${style.charAt(0).toUpperCase() + style.slice(1)} variation generated!`);
    } catch (error) {
      console.error('Error generating variation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate variation');
    } finally {
      setGeneratingVariationFor(null);
    }
  };

  const generateFollowUp = async (openerId: string) => {
    const opener = generatedOpeners.find(o => o.id === openerId);
    if (!opener) return;

    setGeneratingFollowUpFor(openerId);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate', {
        body: {
          profileText,
          userProfileText,
          tones: [opener.tone.toLowerCase()],
          mode: 'followup',
          priorMessage: opener.text,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate follow-ups');
      }
      const newFollowUps = data.results.map((text: string, index: number) => ({
        id: `followup-${Date.now()}-${index}`,
        text,
        openerId,
      }));

      setFollowUps([...followUps, ...newFollowUps]);
      trackEvent('generated_followup', { 
        count: newFollowUps.length,
        openerId 
      });
      toast.success('Follow-ups generated!');
    } catch (error) {
      console.error('Error generating follow-ups:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate follow-ups');
    } finally {
      setGeneratingFollowUpFor(null);
    }
  };

  const hasSelectedOpener = generatedOpeners.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Start a Great Conversation
          </h2>
          <p className="text-lg text-muted-foreground">
            Generate personalized conversation starters in seconds
          </p>
        </div>

        <ReminderBanner />

        <div className="space-y-6">
          <UserProfileInput value={userProfileText} onChange={setUserProfileText} />
          <ProfileInput value={profileText} onChange={setProfileText} />
          <TonePicker selectedTones={selectedTones} onChange={setSelectedTones} />

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 text-lg py-6 rounded-2xl shadow-lg bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
              onClick={() => generateOpeners()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Openers
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-6 py-6 rounded-2xl shadow-md"
              onClick={() => {
                if (hasSelectedOpener) {
                  generateFollowUp(generatedOpeners[0].id);
                }
              }}
              disabled={!hasSelectedOpener || generatingFollowUpFor !== null}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Need a Follow-Up?
            </Button>
          </div>
        </div>

        {generatedOpeners.length > 0 && (
          <div className="space-y-6">
            <OpenerList 
              openers={generatedOpeners} 
              onTryAgain={(openerId) => {
                // Regenerate just this opener
                generateOpeners();
              }}
              onVariation={handleVariation}
            />
            {generatedOpeners.map((opener) => (
              <FollowUpList
                key={opener.id}
                followUps={followUps}
                openerId={opener.id}
              />
            ))}
          </div>
        )}
      </div>

      <PaywallModal open={showPaywallModal} onOpenChange={setShowPaywallModal} />
      <UpgradeSuccessModal open={showSuccessModal} onOpenChange={setShowSuccessModal} />
    </div>
  );
};


export default Generator;
