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
import { GENERATOR_FUNCTIONS_BASE_URL, GENERATOR_ANON_KEY } from "@/config/generator";
import { motion, useAnimation } from "framer-motion";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { sparkBurst } from "@/lib/motionConfig";
import { extractMatchName } from "@/lib/extractMatchName";
import WritingAffiliateBlock from "@/components/WritingAffiliateBlock";
import { isGuest } from "@/lib/guest";
import { parseEdgeFunctionError, friendlyGenerationMessage } from "@/lib/generationErrors";
import { canGuestGenerate, bumpGuestRunsUsed, getGuestRunsState, setGuestRunsUsedToMax, syncFromServer, OPENERS_PER_RUN } from "@/utils/guestLimits";
import { useNavigate } from "react-router-dom";
// GUEST_DEBUG: Dev-only diagnostics panel
import GuestDebugPanel from "@/components/GuestDebugPanel";

// GUEST_UPGRADE: localStorage key for persisting generator form state across auth
const PENDING_STATE_KEY = "betteropnr_pending_generator_state";

/*
  GUEST MODE VERIFICATION CHECKLIST:
  1) Guest can generate 3 times/day and receives exactly 2 openers each run.
  2) 4th attempt returns 429 + GUEST_LIMIT_REACHED and UI disables Generate.
  3) remainingRunsToday updates from server guestLimits.
  4) Guest runs decrement only on success.
  5) Double-click doesn't duplicate requests or consume runs twice.
  6) Upgrade flow restores generator input after signup/login.
  7) CORS allows only betteropnr.com origins.
  8) No service role key in client.
*/
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
  const [lockedSlots, setLockedSlots] = useState(0);
  const [guestAllowedTones, setGuestAllowedTones] = useState<string[] | null>(null);
  const [guestLimit, setGuestLimit] = useState(3); // server-synced daily limit
  const [generatingFollowUpFor, setGeneratingFollowUpFor] = useState<string | null>(null);
  const [generatingVariationFor, setGeneratingVariationFor] = useState<string | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGenerateSuccess, setShowGenerateSuccess] = useState(false);
  // GUEST_DEBUG: Track last response metadata for debug panel
  const [debugLastStatus, setDebugLastStatus] = useState<number | null>(null);
  const [debugLastError, setDebugLastError] = useState<string | null>(null);
  const [debugLastGuestLimits, setDebugLastGuestLimits] = useState<{ remainingRunsToday: number; resetDateUtc: string } | null>(null);
  const sparkControls = useAnimation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // GUEST_UX_LIMITS: Track guest state and remaining runs
  const guestMode = !user && isGuest();

  // GUEST_UPGRADE: Save form state, set upgrade marker, and navigate to auth
  const saveAndNavigate = (path: string, source: 'signup' | 'login' = 'signup') => {
    try {
      localStorage.setItem(PENDING_STATE_KEY, JSON.stringify({
        profileText,
        userProfileText,
        selectedTones,
      }));
      // GUEST_ANALYTICS: mark upgrade started for conversion tracking
      localStorage.setItem("betteropnr_guest_upgrade_started", "1");
    } catch { /* fail silently */ }
    // GUEST_ANALYTICS: track CTA click
    trackEvent(source === 'signup' ? 'guest_click_signup_from_limit' : 'guest_click_login_from_limit', { mode: 'guest' });
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
    // GUEST_ANALYTICS: fire conversion event if upgrade marker exists
    try {
      if (localStorage.getItem("betteropnr_guest_upgrade_started") === "1") {
        trackEvent('guest_converted_to_auth', { mode: 'auth' });
        localStorage.removeItem("betteropnr_guest_upgrade_started");
      }
    } catch { /* fail silently */ }
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

      // PROD_CLEANUP: dev-only instrumentation (no PII)
      if (import.meta.env.DEV) console.log('[GEN_OPENERS]', { mode: guestMode ? 'guest' : 'auth', hasAuth: Boolean(headers.Authorization) });

      // GUEST_ROUTING: Route guests to /generate-guest with simplified payload
      if (guestMode) {
        const guestUrl = `${GENERATOR_FUNCTIONS_BASE_URL}/generate-guest`;
        console.log("[GEN] Using generator host (guest):", new URL(guestUrl).host);

        const guestRes = await fetch(guestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: GENERATOR_ANON_KEY,
            // IMPORTANT: no Authorization header for guests
          },
          body: JSON.stringify({
            tone: selectedTones[0],
            theirProfileText: profileText,
          }),
        });

        let guestData: any = null;
        try { guestData = await guestRes.json(); } catch { /* empty */ }

        if (!guestRes.ok) {
          setDebugLastStatus(guestRes.status);
          setDebugLastError(guestData?.error || guestRes.statusText);

          if (guestRes.status === 429) {
            // Sync usage from response if available
            if (guestData?.usage) {
              if (guestData.usage.limit) setGuestLimit(guestData.usage.limit);
              syncFromServer({ remainingRunsToday: Math.max(0, guestData.usage.limit - guestData.usage.used), resetDateUtc: '' });
              setGuestRemaining(0);
            } else {
              setGuestRunsUsedToMax();
              setGuestRemaining(0);
            }
            toast.error("Guest limit reached. Sign in to continue.", {
              action: { label: "Sign in", onClick: () => saveAndNavigate("/sign-in", "login") },
            });
            return;
          }

          if (guestRes.status === 400 || guestRes.status === 403) {
            toast.error(guestData?.error || "Invalid request. Please try a different tone.");
            // Auto-reset tone to a valid guest tone
            if (guestData?.allowedTones && Array.isArray(guestData.allowedTones)) {
              setGuestAllowedTones(guestData.allowedTones);
              setSelectedTones([guestData.allowedTones[0]]);
            } else {
              setSelectedTones(["playful"]);
            }
            return;
          }

          toast.error(friendlyGenerationMessage(parseEdgeFunctionError({ message: guestData?.error, status: guestRes.status }), true));
          return;
        }

        // Success — parse guest response
        setDebugLastStatus(200);
        setDebugLastError(null);

        const guestOpeners: string[] = guestData?.openers ?? [];
        const guestLockedSlots: number = guestData?.lockedSlots ?? 0;
        if (guestData?.allowedTones) setGuestAllowedTones(guestData.allowedTones);
        if (guestData?.usage) {
          if (guestData.usage.limit) setGuestLimit(guestData.usage.limit);
          const remaining = Math.max(0, guestData.usage.limit - guestData.usage.used);
          syncFromServer({ remainingRunsToday: remaining, resetDateUtc: '' });
          setGuestRemaining(remaining);
        } else {
          const newRemaining = bumpGuestRunsUsed();
          setGuestRemaining(newRemaining);
        }

        const openers = guestOpeners.map((text: string, index: number) => ({
          id: `opener-${Date.now()}-${index}`,
          text,
          tone: selectedTones[0].charAt(0).toUpperCase() + selectedTones[0].slice(1),
        }));

        setGeneratedOpeners(openers);
        setLockedSlots(guestLockedSlots);
        trackEvent('guest_generate_success', { mode: 'guest', count: openers.length });
        toast.success('Openers generated!');
        setShowGenerateSuccess(true);
        setTimeout(() => setShowGenerateSuccess(false), 3000);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        return; // Done — skip auth path below
      }

      // AUTH PATH: Authenticated user flow
      const genUrl = `${GENERATOR_FUNCTIONS_BASE_URL}/generate`;
      console.log("[GEN] Using generator host:", new URL(genUrl).host);

      const fetchHeaders: Record<string, string> = { "Content-Type": "application/json", "apikey": GENERATOR_ANON_KEY, ...headers };
      const res = await fetch(genUrl, {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({
          profileText,
          userProfileText,
          tones: selectedTones,
          mode: 'opener',
          variationStyle,
          userId: user?.id ?? 'guest',
          userEmail: user?.primaryEmailAddress?.emailAddress ?? undefined,
        }),
      });

      let data: any = null;
      let error: any = null;
      try { data = await res.json(); } catch { /* empty */ }
      if (!res.ok) {
        error = { message: data?.error || res.statusText, context: { status: res.status, body: data, response: data } };
      }
      
      if (error) {
        // GUEST_HARDENING: Structured error parsing + friendly messages
        const parsed = parseEdgeFunctionError(error);
        setDebugLastStatus(parsed.status);
        setDebugLastError(parsed.code || parsed.message);

        // Logged-in: paywall for daily-limit 403
        if (parsed.status === 403 || parsed.message.toLowerCase().includes('daily limit')) {
          setShowPaywallModal(true);
          toast.error('Daily limit reached. Upgrade for unlimited openers!');
          return;
        }

        toast.error(friendlyGenerationMessage(parsed, false));
        return;
      }

      if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
        if (import.meta.env.DEV) console.error('Invalid response from edge function:', data);
        toast.error('No openers generated. Please try again.');
        return;
      }

      // GUEST_DEBUG: capture success metadata
      setDebugLastStatus(200);
      setDebugLastError(null);

      setLockedSlots(0); // Auth users don't have locked slots

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

      const varUrl = `${GENERATOR_FUNCTIONS_BASE_URL}/generate`;
      console.log("[GEN] Using generator host:", new URL(varUrl).host);
      const varRes = await fetch(varUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": GENERATOR_ANON_KEY, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          profileText,
          userProfileText,
          tones: selectedTones,
          mode: 'opener',
          variationStyle: style,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });
      let data: any = null;
      let error: any = null;
      try { data = await varRes.json(); } catch { /* empty */ }
      if (!varRes.ok) {
        error = { message: data?.error || varRes.statusText, context: { status: varRes.status, response: data } };
      }

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

      const fuUrl = `${GENERATOR_FUNCTIONS_BASE_URL}/generate`;
      console.log("[GEN] Using generator host:", new URL(fuUrl).host);
      const fuRes = await fetch(fuUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": GENERATOR_ANON_KEY, Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          profileText,
          userProfileText,
          tones: [opener.tone.toLowerCase()],
          mode: 'followup',
          priorMessage: opener.text,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });
      let data: any = null;
      let error: any = null;
      try { data = await fuRes.json(); } catch { /* empty */ }
      if (!fuRes.ok) {
        error = { message: data?.error || fuRes.statusText, context: { status: fuRes.status, response: data } };
      }

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
                      Guest mode: {guestRemaining} / {guestLimit} runs left today
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
                          onClick={() => saveAndNavigate("/sign-up", "signup")}
                        >
                          Sign up
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => saveAndNavigate("/sign-in", "login")}
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
                lockedSlots={lockedSlots}
                onTryAgain={() => generateOpeners()}
                onVariation={guestMode ? undefined : handleVariation}
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

      {/* GUEST_DEBUG: Dev-only diagnostics panel */}
      {import.meta.env.DEV && (
        <GuestDebugPanel
          lastStatus={debugLastStatus}
          lastErrorCode={debugLastError}
          lastGuestLimits={debugLastGuestLimits}
          onResetCache={() => {
            ["betteropnr_guest_server_remaining", "betteropnr_guest_server_reset_utc", "betteropnr_guest_runs_used", "betteropnr_guest_runs_date"].forEach(k => localStorage.removeItem(k));
            setGuestRemaining(3);
            setDebugLastGuestLimits(null);
          }}
          onSimulateExhausted={() => {
            localStorage.setItem("betteropnr_guest_server_remaining", "0");
            setGuestRemaining(0);
          }}
        />
      )}
    </div>
  );
};


export default Generator;
