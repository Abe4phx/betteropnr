import { useState } from "react";
import { ProfileInput } from "@/components/ProfileInput";
import { TonePicker } from "@/components/TonePicker";
import { OpenerList } from "@/components/OpenerList";
import { FollowUpList } from "@/components/FollowUpList";
import { ReminderBanner } from "@/components/ReminderBanner";
import { Button } from "@/components/ui/button";
import { useTalkSpark } from "@/contexts/TalkSparkContext";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

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

  const generateOpeners = async () => {
    if (!profileText.trim()) {
      toast.error('Please enter some profile information');
      return;
    }
    
    if (selectedTones.length === 0) {
      toast.error('Please select at least one tone');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            profileText,
            tones: selectedTones,
            mode: 'opener',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate openers');
      }

      const data = await response.json();
      const openers = data.results.map((text: string, index: number) => ({
        id: `opener-${Date.now()}-${index}`,
        text,
        tone: selectedTones[index % selectedTones.length].charAt(0).toUpperCase() + 
              selectedTones[index % selectedTones.length].slice(1),
      }));

      setGeneratedOpeners(openers);
      trackEvent('generated_opener', { 
        count: openers.length, 
        tones: selectedTones.join(',') 
      });
      toast.success('Openers generated!');
    } catch (error) {
      console.error('Error generating openers:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate openers');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFollowUp = async (openerId: string) => {
    const opener = generatedOpeners.find(o => o.id === openerId);
    if (!opener) return;

    setGeneratingFollowUpFor(openerId);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            profileText,
            tones: [opener.tone.toLowerCase()],
            mode: 'followup',
            priorMessage: opener.text,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate follow-ups');
      }

      const data = await response.json();
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


export default Generator;
