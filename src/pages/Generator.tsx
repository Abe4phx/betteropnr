import { useState } from "react";
import { ProfileInput } from "@/components/ProfileInput";
import { TonePicker } from "@/components/TonePicker";
import { OpenerList } from "@/components/OpenerList";
import { FollowUpList } from "@/components/FollowUpList";
import { Button } from "@/components/ui/button";
import { useTalkSpark } from "@/contexts/TalkSparkContext";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

const Generator = () => {
  const {
    profileText,
    setProfileText,
    selectedTones,
    setSelectedTones,
    generatedOpeners,
    setGeneratedOpeners,
    followUps,
    setFollowUps,
  } = useTalkSpark();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingFollowUpFor, setGeneratingFollowUpFor] = useState<string | null>(null);

  const generateOpeners = () => {
    if (!profileText.trim()) {
      toast.error('Please enter some profile information');
      return;
    }
    
    if (selectedTones.length === 0) {
      toast.error('Please select at least one tone');
      return;
    }

    setIsGenerating(true);

    // Simulate API call with mock data
    setTimeout(() => {
      const mockOpeners = selectedTones.map((tone, index) => ({
        id: `opener-${Date.now()}-${index}`,
        text: getMockOpener(tone, profileText),
        tone: tone.charAt(0).toUpperCase() + tone.slice(1),
      }));

      setGeneratedOpeners(mockOpeners);
      setIsGenerating(false);
      toast.success('Openers generated!');
    }, 1500);
  };

  const generateFollowUp = (openerId: string) => {
    setGeneratingFollowUpFor(openerId);
    
    setTimeout(() => {
      const mockFollowUps = [
        {
          id: `followup-${Date.now()}-1`,
          text: "What got you interested in that?",
          openerId,
        },
        {
          id: `followup-${Date.now()}-2`,
          text: "That sounds fascinating! Tell me more about it.",
          openerId,
        },
        {
          id: `followup-${Date.now()}-3`,
          text: "How long have you been into that?",
          openerId,
        },
      ];

      setFollowUps([...followUps, ...mockFollowUps]);
      setGeneratingFollowUpFor(null);
      toast.success('Follow-ups generated!');
    }, 1000);
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

        <div className="space-y-6">
          <ProfileInput value={profileText} onChange={setProfileText} />
          <TonePicker selectedTones={selectedTones} onChange={setSelectedTones} />

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 text-lg py-6 rounded-2xl shadow-lg bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
              onClick={generateOpeners}
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
    </div>
  );
};

// Mock data generator
function getMockOpener(tone: string, profile: string): string {
  const openers: Record<string, string[]> = {
    playful: [
      "Hey! I noticed we might have some fun things in common. What's the most spontaneous thing you've done lately?",
      "Your profile made me smile! What's something that always makes you laugh?",
      "If you could teleport anywhere right now for an adventure, where would you go?",
    ],
    sincere: [
      "I really appreciated reading your profile. What's something you're genuinely passionate about?",
      "Your interests caught my attention. What's a cause or value that's truly important to you?",
      "I'd love to know more about you. What's something you've been reflecting on lately?",
    ],
    confident: [
      "I think we'd have great conversations. What's a goal you're currently working towards?",
      "Your profile stood out to me. What's something you're really proud of accomplishing?",
      "I'm curious about your perspective on something—what's a belief you hold strongly?",
    ],
    funny: [
      "If you could have any superpower, but it had to be completely useless, what would it be?",
      "What's the weirdest food combination you actually enjoy? I promise not to judge... much.",
      "If your life was a sitcom, what would the theme song be?",
    ],
  };

  const toneOpeners = openers[tone] || openers.playful;
  return toneOpeners[Math.floor(Math.random() * toneOpeners.length)];
}

export default Generator;
