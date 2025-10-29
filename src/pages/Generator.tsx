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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-heading font-bold">Start a Great Conversation</h2>
          <p className="text-lg text-muted-foreground">
            Generate personalized conversation starters in seconds
          </p>
        </div>

        <div className="space-y-6">
          <ProfileInput value={profileText} onChange={setProfileText} />
          <TonePicker selectedTones={selectedTones} onChange={setSelectedTones} />

          <Button
            size="lg"
            className="w-full text-lg py-6"
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
        </div>

        {generatedOpeners.length > 0 && (
          <div className="space-y-4">
            <OpenerList 
              openers={generatedOpeners} 
              onGenerateFollowUp={generateFollowUp}
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
    casual: [
      "Hey! I noticed we might have some things in common. What's something you're passionate about?",
      "Hi there! What's been the highlight of your week so far?",
      "What's something interesting you've learned recently?",
    ],
    professional: [
      "I'd love to learn more about your professional background. What inspired your career path?",
      "What projects are you currently most excited about?",
      "How did you get started in your field?",
    ],
    flirty: [
      "I have to say, your profile really caught my attention. What's your idea of a perfect evening?",
      "You seem like someone worth getting to know better. What makes you smile?",
      "What's something adventurous you've always wanted to try?",
    ],
    funny: [
      "If you could have any superpower, but it had to be completely useless, what would it be?",
      "What's the weirdest food combination you actually enjoy?",
      "If your life was a movie, what genre would it be and why?",
    ],
    thoughtful: [
      "What's something you believe that most people don't?",
      "If you could have dinner with anyone from history, who would it be and what would you ask them?",
      "What's a book or idea that significantly changed your perspective?",
    ],
    creative: [
      "If you could design your dream day with no limitations, what would it look like?",
      "What's the most creative thing you've done recently?",
      "If you had to describe yourself using only colors and shapes, what would that look like?",
    ],
  };

  const toneOpeners = openers[tone] || openers.casual;
  return toneOpeners[Math.floor(Math.random() * toneOpeners.length)];
}

export default Generator;
