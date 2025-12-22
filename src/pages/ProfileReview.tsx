import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Play, Zap, Check, Eye, MessageSquare, Camera, RefreshCw, Lightbulb } from "lucide-react";
import PhotoAffiliateBlock from "@/components/PhotoAffiliateBlock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PaywallModal } from "@/components/PaywallModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface ProfileReviewResult {
  score: number;
  scoreLabel: string;
  keyObservations: string[];
  quickTip: string;
  deeperInsights?: string[];
  suggestedRewrite?: string;
  fullBreakdown?: {
    firstImpression: string;
    personalityClarity: string;
    engagementPotential: string;
    authenticity: string;
    matchability: string;
  };
  rewrites?: { tone: string; text: string }[];
  lineFeedback?: { original: string; suggestion: string; reason: string }[];
  photoGuidance?: string[];
}

const ProfileReview = () => {
  const { user } = useUser();
  const { plan } = useUserPlan();
  const isPro = plan === 'pro' || plan === 'creator';
  const { profileText, setProfileText, isLoading: isProfileLoading } = useUserProfile();
  
  const [bioText, setBioText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProfileReviewResult | null>(null);
  const [currentTier, setCurrentTier] = useState<'free' | 'video' | 'pro'>('free');
  const [hasUsedVideoUnlock, setHasUsedVideoUnlock] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Pre-populate bio with saved profile text
  useEffect(() => {
    if (!hasInitialized && !isProfileLoading && profileText) {
      setBioText(profileText);
      setHasInitialized(true);
    } else if (!isProfileLoading && !profileText) {
      setHasInitialized(true);
    }
  }, [profileText, isProfileLoading, hasInitialized]);

  // Sync bio text back to user profile when it changes
  useEffect(() => {
    if (hasInitialized && bioText !== profileText) {
      setProfileText(bioText);
    }
  }, [bioText, hasInitialized, setProfileText]);

  const handleReview = async (tier: 'free' | 'video' | 'pro' = 'free') => {
    if (!bioText.trim()) {
      toast.error("Please paste your bio first");
      return;
    }

    if (bioText.trim().length < 10) {
      toast.error("Please enter a longer bio (at least 10 characters)");
      return;
    }

    setIsLoading(true);
    setCurrentTier(tier);

    try {
      const { data, error } = await supabase.functions.invoke('review-profile', {
        body: { bioText: bioText.trim(), tier }
      });

      if (error) {
        const status = (error as any)?.context?.status || (error as any)?.status;
        if (status === 429) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
          return;
        }
        if (status === 402) {
          toast.error("AI credits exhausted. Please try again later.");
          return;
        }
        throw new Error((error as any)?.message || 'Failed to review profile');
      }

      setResult(data);
      trackEvent('profile_reviewed', { tier });
      
      if (tier === 'video') {
        setHasUsedVideoUnlock(true);
      }
    } catch (error) {
      console.error('Error reviewing profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to review profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUnlock = () => {
    // For now, simulate video watch - in production, integrate with a video player
    toast.info("Video unlocking feature coming soon! For now, enjoy the preview.", { duration: 3000 });
    handleReview('video');
  };

  const handleProReview = () => {
    if (isPro) {
      handleReview('pro');
    } else {
      setShowPaywallModal(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-secondary';
    if (score >= 40) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-success/20 to-success/5';
    if (score >= 60) return 'from-secondary/20 to-secondary/5';
    if (score >= 40) return 'from-primary/20 to-primary/5';
    return 'from-muted/20 to-muted/5';
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-2"
          >
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Profile Review
            </h1>
            <p className="text-muted-foreground">
              See how your dating profile comes across — and how to improve it.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-8"
        >
          {/* Explanation */}
          <Card className="p-6 bg-card border-none shadow-soft">
            <p className="text-foreground/80 leading-relaxed">
              Your profile makes the first impression before you ever say a word. We'll review how it reads to someone new and suggest ways to stand out.
            </p>
          </Card>

          {/* Input Section */}
          <Card className="p-6 bg-card border-none shadow-soft space-y-4">
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-foreground">
                Paste your current bio
              </label>
              <Textarea
                id="bio"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Weekend hikes, coffee lover, always down to try new food…"
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleReview(isPro ? 'pro' : 'free')}
                disabled={isLoading || !bioText.trim()}
                size="lg"
                className="flex-1 shadow-md"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Review My Profile
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Takes about 10 seconds
            </p>
          </Card>

          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-8 bg-card border-none shadow-soft text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Reviewing first impressions…</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Looking at clarity, tone, and engagement potential.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <Card className={`p-6 bg-gradient-to-br ${getScoreGradient(result.score)} border-none shadow-soft`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold text-foreground">First Impression Score</h3>
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                      {result.score}/100
                    </Badge>
                  </div>
                  <Progress value={result.score} className="h-3 mb-4" />
                  <p className={`font-medium ${getScoreColor(result.score)}`}>
                    {result.scoreLabel}
                  </p>
                </Card>

                {/* Key Observations */}
                <Card className="p-6 bg-card border-none shadow-soft space-y-4">
                  <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    What stands out
                  </h3>
                  <ul className="space-y-3">
                    {result.keyObservations.map((observation, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-foreground/80">{observation}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Quick Tip */}
                <Card className="p-6 bg-card border-none shadow-soft space-y-3">
                  <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-secondary" />
                    Quick improvement
                  </h3>
                  <p className="text-foreground/80">{result.quickTip}</p>
                </Card>

                {/* Deeper Insights (Video/Pro) */}
                {(currentTier === 'video' || currentTier === 'pro') && result.deeperInsights && (
                  <Card className="p-6 bg-card border-none shadow-soft space-y-4">
                    <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                      <Eye className="w-5 h-5 text-accent" />
                      Deeper insights
                    </h3>
                    <ul className="space-y-3">
                      {result.deeperInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                          <span className="text-foreground/80">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Suggested Rewrite (Video/Pro) */}
                {(currentTier === 'video' || currentTier === 'pro') && result.suggestedRewrite && (
                  <Card className="p-6 bg-card border-none shadow-soft space-y-3">
                    <h3 className="font-heading font-semibold text-foreground">Suggested revision</h3>
                    <div className="bg-muted rounded-xl p-4 border border-border">
                      <p className="text-foreground italic">"{result.suggestedRewrite}"</p>
                    </div>
                  </Card>
                )}

                {/* Pro-only: Full Breakdown */}
                {currentTier === 'pro' && result.fullBreakdown && (
                  <Card className="p-6 bg-card border-none shadow-soft space-y-4">
                    <h3 className="font-heading font-semibold text-foreground">Full Profile Breakdown</h3>
                    <div className="space-y-4">
                      {Object.entries(result.fullBreakdown).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <h4 className="text-sm font-medium text-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-foreground/70">{value}</p>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Pro-only: Multiple Rewrites */}
                {currentTier === 'pro' && result.rewrites && result.rewrites.length > 0 && (
                  <Card className="p-6 bg-card border-none shadow-soft space-y-4">
                    <h3 className="font-heading font-semibold text-foreground">Bio Rewrites</h3>
                    <div className="grid gap-4">
                      {result.rewrites.map((rewrite, index) => (
                        <div key={index} className="bg-muted rounded-xl p-4 border border-border space-y-2">
                          <Badge variant="outline" className="text-xs">{rewrite.tone}</Badge>
                          <p className="text-foreground/80 text-sm">"{rewrite.text}"</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Pro-only: Line Feedback */}
                {currentTier === 'pro' && result.lineFeedback && result.lineFeedback.length > 0 && (
                  <Card className="p-6 bg-card border-none shadow-soft space-y-4">
                    <h3 className="font-heading font-semibold text-foreground">Line-by-Line Feedback</h3>
                    <div className="space-y-4">
                      {result.lineFeedback.map((feedback, index) => (
                        <div key={index} className="space-y-2 p-4 bg-muted rounded-xl">
                          <p className="text-sm line-through text-muted-foreground">"{feedback.original}"</p>
                          <p className="text-sm text-foreground font-medium">→ "{feedback.suggestion}"</p>
                          <p className="text-xs text-foreground/60">{feedback.reason}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Pro-only: Photo Guidance */}
                {currentTier === 'pro' && result.photoGuidance && result.photoGuidance.length > 0 && (
                  <Card className="p-6 bg-card border-none shadow-soft space-y-4">
                    <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      Photo Guidance
                    </h3>
                    <ul className="space-y-3">
                      {result.photoGuidance.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">{index + 1}</span>
                          </div>
                          <span className="text-foreground/80">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Optional affiliate recommendation */}
                <PhotoAffiliateBlock />

                {/* Locked Teaser (Free tier only) */}
                {currentTier === 'free' && (
                  <Card className="p-6 bg-card border-none shadow-soft relative overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60 z-10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-4 opacity-40">
                      <h3 className="font-heading font-semibold text-foreground">What we'd improve next</h3>
                      <ul className="space-y-2 text-foreground/60">
                        <li>• Tone & engagement analysis</li>
                        <li>• Suggested rewrite</li>
                        <li>• Photo guidance</li>
                      </ul>
                    </div>
                  </Card>
                )}

                {/* Unlock Options (Free tier) */}
                {currentTier === 'free' && !isPro && (
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground text-sm">
                      Unlock more insights below.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Video Unlock */}
                      <Card className="p-6 bg-card border-none shadow-soft space-y-4">
                        <h4 className="font-heading font-semibold text-foreground">Unlock more insights</h4>
                        <p className="text-sm text-muted-foreground">
                          Watch a short video to see deeper feedback and one suggested rewrite.
                        </p>
                        <Button
                          onClick={handleVideoUnlock}
                          variant="outline"
                          className="w-full"
                          disabled={hasUsedVideoUnlock}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {hasUsedVideoUnlock ? 'Already Unlocked' : 'Unlock with Video'}
                        </Button>
                      </Card>

                      {/* Pro Upgrade */}
                      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-none shadow-soft space-y-4">
                        <h4 className="font-heading font-semibold text-foreground">Go Pro</h4>
                        <p className="text-sm text-muted-foreground">
                          Get full profile optimization, multiple rewrites, and unlimited reviews.
                        </p>
                        <Button
                          onClick={handleProReview}
                          className="w-full"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          No ads. Unlimited access.
                        </p>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Video-unlocked: Premium boundary message */}
                {currentTier === 'video' && !isPro && (
                  <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-none shadow-soft text-center space-y-4">
                    <p className="text-foreground/80">
                      Want more rewrites, tone options, and photo tips? That's included with Pro.
                    </p>
                    <Button onClick={() => setShowPaywallModal(true)}>
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </Card>
                )}

                {/* Pro: Re-review button */}
                {isPro && (
                  <div className="text-center">
                    <Button
                      onClick={() => handleReview('pro')}
                      variant="outline"
                      disabled={isLoading || !bioText.trim()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-review Profile
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Unlimited re-reviews with Pro
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <PaywallModal open={showPaywallModal} onOpenChange={setShowPaywallModal} />
    </div>
  );
};

export default ProfileReview;
