import { useState, useEffect, useMemo, useRef } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ProfileInput } from "@/components/ProfileInput";
import { UserProfileInput } from "@/components/UserProfileInput";
import { TonePicker } from "@/components/TonePicker";
import { OpenerList } from "@/components/OpenerList";
import { FollowUpList } from "@/components/FollowUpList";
import { ReminderBanner } from "@/components/ReminderBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBetterOpnr } from "@/contexts/TalkSparkContext";
import { Opener } from "@/contexts/TalkSparkContext";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useIsNewUser } from "@/hooks/useIsNewUser";
import { useClerkSyncContext } from "@/contexts/ClerkSyncContext";
import { PaywallModal } from "@/components/PaywallModal";
import { UpgradeSuccessModal } from "@/components/UpgradeSuccessModal";
import { supabase } from "@/integrations/supabase/client";
import { motion, useAnimation } from "framer-motion";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { sparkBurst } from "@/lib/motionConfig";
import { extractMatchName } from "@/lib/extractMatchName";
import WritingAffiliateBlock from "@/components/WritingAffiliateBlock";
import { isGuest } from "@/lib/guest";
import { parseEdgeFunctionError, friendlyGenerationMessage } from "@/lib/generationErrors";
import { canGuestGenerate, bumpGuestRunsUsed, getGuestRunsState, setGuestRunsUsedToMax, syncFromServer, OPENERS_PER_RUN } from "@/utils/guestLimits";
import { useNavigate } from "react-router-dom";

// GUEST_UPGRADE: localStorage key for persisting generator form state across auth
const PENDING_STATE_KEY = "betteropnr_pending_generator_state";

const Generator = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
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
  const { isSynced } = useClerkSyncContext();
  const { isNewUser, isChecking } = useIsNewUser(isSynced);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingFollowUpFor, setGeneratingFollowUpFor] = useState<string | null>(null);
  const [generatingVariationFor, setGeneratingVariationFor] = useState<string | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGenerateSuccess, setShowGenerateSuccess] = useState(false);
  const sparkControls = useAnimation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // GUEST_UX_LIMITS: Track guest state and remaining runs
  const guestMode = !user && isGuest();

  // GUEST_UPGRADE: Save form state and navigate to auth
  const saveAndNavigate = (path: string) => {
    try {
      localStorage.setItem(PENDING_STATE_KEY, JSON.stringify({
        profileText,
        userProfileText,
        selectedTones,
      }));
    } catch { /* fail silently */ }
    navigate(path);
  };
  const [guestRemaining, setGuestRemaining] = useState(() => guestMode ? getGuestRunsState().remaining : 0);

  // GUEST_UX_LIMITS: Keep guestRemaining in sync when guestMode changes
  useEffect(() => {
    if (guestMode) setGuestRemaining(getGuestRunsState().remaining);
  }, [guestMode]);

  // Extract match name from profile text
  const matchName = useMemo(() => extractMatchName(profileText), [profileText]);

  // GUEST_UPGRADE: Restore form state after guest signs up/logs in
  useEffect(() => {
    if (!user) return; // only for authenticated users
    try {
      const raw = localStorage.getItem(PENDING_STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.profileText) setProfileText(saved.profileText);
      if (saved.userProfileText) setUserProfileText(saved.userProfileText);
      if (Array.isArray(saved.selectedTones) && saved.selectedTones.length > 0) setSelectedTones(saved.selectedTones);
      localStorage.removeItem(PENDING_STATE_KEY);
    } catch {
      localStorage.removeItem(PENDING_STATE_KEY);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // GUEST_UX_LIMITS: Block guests who have exhausted daily limit
    if (guestMode) {
      if (!canGuestGenerate()) {
        toast.error("You've used today's guest limit. Create a free account to keep generating.");
        setGuestRemaining(0);
        return;
      }
      // Don't consume run yet — wait for successful response
    }

    // Check usage limits for free users (logged-in only)
    if (!guestMode && plan === 'free' && usage.hasExceededOpenerLimit) {
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
      // GUEST_LIMITS: Guests don't have a Clerk user; skip auth check for them
      if (!guestMode && !user?.id) {
        toast.error('Please sign in to generate openers');
        return;
      }

      const token = guestMode ? null : await getToken();
      if (!guestMode && !token) {
        toast.error('Authentication required');
        return;
      }

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // GUEST_HARDENING: minimal instrumentation (no PII)
      console.log('[GEN_OPENERS]', { mode: guestMode ? 'guest' : 'auth', hasAuth: Boolean(headers.Authorization) });

      const { data, error } = await supabase.functions.invoke('generate', {
        body: {
          profileText,
          userProfileText,
          tones: selectedTones,
          mode: 'opener',
          variationStyle,
          userId: user?.id ?? 'guest',
          userEmail: user?.primaryEmailAddress?.emailAddress ?? undefined,
        },
        headers,
      });
      
      if (error) {
        // GUEST_HARDENING: Structured error parsing + friendly messages
        const parsed = parseEdgeFunctionError(error);
        console.log('[GEN_OPENERS] error', { mode: guestMode ? 'guest' : 'auth', status: parsed.status, code: parsed.code });

        // GUEST_UX_LIMITS: Handle server-side guest limit — sync local state
        if (parsed.status === 429 && parsed.code === 'GUEST_LIMIT_REACHED' && guestMode) {
          // GUEST_LIMITS_SYNC: Prefer server-provided guestLimits if present
          const errorBody = (error as any)?.context?.body || (error as any)?.context?.response;
          if (errorBody?.guestLimits) {
            const synced = syncFromServer(errorBody.guestLimits);
            setGuestRemaining(synced);
          } else {
            setGuestRunsUsedToMax();
            setGuestRemaining(0);
          }
          toast.error(
            "You've used today's guest limit. Create a free account to keep generating.",
            { action: { label: "Sign up", onClick: () => saveAndNavigate("/sign-up") } }
          );
          return;
        }

        // GUEST_HARDENING: Guest gets friendly message + sign-up CTA for auth errors
        if (guestMode && (parsed.status === 401 || parsed.status === 403)) {
          toast.error(friendlyGenerationMessage(parsed, true), {
            action: { label: "Sign up", onClick: () => saveAndNavigate("/sign-up") },
          });
          return;
        }

        // Logged-in: paywall for daily-limit 403
        if (!guestMode && (parsed.status === 403 || parsed.message.toLowerCase().includes('daily limit'))) {
          setShowPaywallModal(true);
          toast.error('Daily limit reached. Upgrade for unlimited openers!');
          return;
        }

        // GUEST_HARDENING: Friendly message for all remaining errors
        toast.error(friendlyGenerationMessage(parsed, guestMode));
        return;
      }

      if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
        console.error('Invalid response from edge function:', data);
        toast.error('No openers generated. Please try again.');
        return;
      }

      // GUEST_UX_LIMITS: Cap openers to OPENERS_PER_RUN for guests
      const results = guestMode ? data.results.slice(0, OPENERS_PER_RUN) : data.results;

      // GUEST_LIMITS_SYNC: Prefer server-provided guestLimits over local bump
      if (guestMode) {
        if (data.guestLimits) {
          const synced = syncFromServer(data.guestLimits);
          setGuestRemaining(synced);
        } else {
          const remaining = bumpGuestRunsUsed();
          setGuestRemaining(remaining);
        }
      }

      const openers = results.map((text: string, index: number) => ({
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
      // GUEST_HARDENING: never show raw errors to user
      console.error('Error generating openers:', error);
      toast.error('Something went wrong generating openers. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariation = async (openerId: string, style: 'safer' | 'warmer' | 'funnier' | 'shorter') => {
    setGeneratingVariationFor(openerId);
    toast.info(`Generating ${style} variation...`);
    
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        setGeneratingVariationFor(null);
        return;
      }

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
        headers: { Authorization: `Bearer ${token}` },
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
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        setGeneratingFollowUpFor(null);
        return;
      }

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
        headers: { Authorization: `Bearer ${token}` },
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
      {/* Compact Greeting Bar */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            {!isChecking && isNewUser ? (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-heading font-semibold text-foreground">
                  Welcome! Let's create your first opener 🎉
                </h1>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-heading font-semibold text-foreground">
                    Hey {user?.firstName || 'there'}! 👋
                  </h1>
                  {!usageLoading && (
                    <>
                      <span className="hidden sm:inline text-muted-foreground">•</span>
                      {plan === 'free' ? (
                        <Badge variant="secondary" className="text-sm">
                          {usage.openers_generated} / 5 openers used today
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-sm">
                          Unlimited openers
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                disabled={isGenerating || usageLoading || (guestMode && guestRemaining <= 0)}
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

              {/* GUEST_UX_LIMITS: Show remaining runs or exhaustion CTA */}
              {guestMode && (
                <div className="mt-3 text-center">
                  {guestRemaining > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Guest mode: {guestRemaining} / 3 runs left today
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        You've used today's guest limit. Create a free account to keep generating.
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => saveAndNavigate("/sign-up")}
                        >
                          Sign up
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => saveAndNavigate("/sign-in")}
                        >
                          Log in
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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

              {/* Optional affiliate recommendation */}
              <WritingAffiliateBlock className="mt-6" />
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
