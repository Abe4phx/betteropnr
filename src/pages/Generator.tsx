import { useState, useEffect, useMemo, useRef } from "react";
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
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PaywallModal } from "@/components/PaywallModal";
import { UpgradeSuccessModal } from "@/components/UpgradeSuccessModal";
import { supabase } from "@/integrations/supabase/client";
import { motion, useAnimation } from "framer-motion";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { sparkBurst } from "@/lib/motionConfig";
import { extractMatchName } from "@/lib/extractMatchName";

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
  const [showGenerateSuccess, setShowGenerateSuccess] = useState(false);
  const sparkControls = useAnimation();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Extract match name from profile text
  const matchName = useMemo(() => extractMatchName(profileText), [profileText]);

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
    // Trigger spark burst animation
    sparkControls.start({
      scale: 1.1,
      opacity: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    });

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

        const status = (error as any)?.context?.status || (error as any)?.status;
        const serverMsg = (error as any)?.context?.error || (error as any)?.context?.response?.error || (error as any)?.message;

        if (status === 402) {
          toast.error('AI credits exhausted. Please add credits to continue.');
          return;
        }
        if (status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
          return;
        }
        if (status === 403 || (serverMsg && String(serverMsg).toLowerCase().includes('daily limit'))) {
          setShowPaywallModal(true);
          toast.error('Daily limit reached. Upgrade for unlimited openers!');
          return;
        }
        if (serverMsg && String(serverMsg).toLowerCase().includes('timeout')) {
          toast.error('Request timed out. Please try again.');
          return;
        }

        throw new Error(serverMsg || 'Failed to generate openers');
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
      
      // Show success checkmark on button
      setShowGenerateSuccess(true);
      setTimeout(() => setShowGenerateSuccess(false), 3000);
      
      // Scroll to results after a brief delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
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
        console.error('Variation edge function error:', error);
        const status = (error as any)?.context?.status || (error as any)?.status;
        const serverMsg = (error as any)?.context?.error || (error as any)?.context?.response?.error || (error as any)?.message;

        if (status === 402) {
          toast.error('AI credits exhausted. Please add credits to continue.');
          return;
        }
        if (status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
          return;
        }
        if (status === 403 || (serverMsg && String(serverMsg).toLowerCase().includes('daily limit'))) {
          setShowPaywallModal(true);
          toast.error('Daily limit reached. Upgrade for unlimited openers!');
          return;
        }

        throw new Error(serverMsg || 'Failed to generate variation');
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
        console.error('Follow-up edge function error:', error);
        const status = (error as any)?.context?.status || (error as any)?.status;
        const serverMsg = (error as any)?.context?.error || (error as any)?.context?.response?.error || (error as any)?.message;

        if (status === 402) {
          toast.error('AI credits exhausted. Please add credits to continue.');
          return;
        }
        if (status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
          return;
        }
        if (status === 403 || (serverMsg && String(serverMsg).toLowerCase().includes('daily limit'))) {
          setShowPaywallModal(true);
          toast.error('Daily limit reached. Upgrade for unlimited openers!');
          return;
        }

        throw new Error(serverMsg || 'Failed to generate follow-ups');
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
    <div className="min-h-screen bg-muted">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-bo-gradient text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold">
              Start better conversations — get more replies.
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Generate personalized conversation starters that actually work. No more awkward first messages.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl mt-4"
              onClick={() => {
                const inputSection = document.getElementById('input-section');
                inputSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Opener
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl" id="input-section">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-8"
        >
          <ReminderBanner />

          <div className="bg-card rounded-3xl shadow-soft p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-foreground">
                Let's craft something great
              </h2>
              <p className="text-muted-foreground">
                Tell us about them, and we'll help you break the ice
              </p>
            </div>

            <UserProfileInput value={userProfileText} onChange={setUserProfileText} />
            <ProfileInput value={profileText} onChange={setProfileText} />
            <TonePicker selectedTones={selectedTones} onChange={setSelectedTones} />

            <div className="relative">
              {/* Spark burst background animation */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 -z-10"
                animate={sparkControls}
                initial={{ scale: 0.9, opacity: 0 }}
              />
              
              <Button
                onClick={() => generateOpeners()}
                disabled={isGenerating || usageLoading}
                size="lg"
                className="w-full shadow-md transition-all"
              >
                {showGenerateSuccess ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5 mr-2" />
                    </motion.div>
                    Generated!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Openers'}
                  </>
                )}
              </Button>
            </div>

            {plan === 'free' && (
              <p className="text-sm text-center text-muted-foreground">
                {usage.openers_generated} / 5 openers used today
              </p>
            )}
          </div>

          {/* Loading skeleton while generating */}
          {isGenerating && <LoadingSkeleton />}

          {generatedOpeners.length > 0 && !isGenerating && (
            <motion.div
              ref={resultsRef}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-heading font-bold text-foreground">
                  Your Conversation Starters
                </h3>
                <p className="text-muted-foreground">
                  Pick your favorite and make it your own
                </p>
              </div>
              
              <OpenerList
                openers={generatedOpeners}
                matchName={matchName}
                onTryAgain={() => generateOpeners()}
                onVariation={handleVariation}
                onShowPaywall={() => setShowPaywallModal(true)}
              />

              {generatedOpeners.map((opener) => (
                <FollowUpList
                  key={opener.id}
                  followUps={followUps}
                  openerId={opener.id}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <PaywallModal open={showPaywallModal} onOpenChange={setShowPaywallModal} />
      <UpgradeSuccessModal open={showSuccessModal} onOpenChange={setShowSuccessModal} />
    </div>
  );
};


export default Generator;
