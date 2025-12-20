import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewRequest {
  bioText: string;
  tier: 'free' | 'video' | 'pro';
}

interface ProfileReviewResult {
  score: number;
  scoreLabel: string;
  keyObservations: string[];
  quickTip: string;
  // Video unlock extras
  deeperInsights?: string[];
  suggestedRewrite?: string;
  // Pro extras
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bioText, tier }: ReviewRequest = await req.json();

    if (!bioText || bioText.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Please provide a bio with at least 10 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt based on tier
    let systemPrompt = `You are an AI dating profile review assistant for BetterOpnr.

Your purpose is to evaluate dating profile bios for first-impression success and conversation initiation.
You are NOT judging attractiveness, worth, or relationship potential.

GLOBAL RULES (MANDATORY):
1. Tone must always be supportive, calm, and confidence-building.
2. Never shame, judge, compare, or rank the user against others.
3. Never use absolute language ("bad", "terrible", "always", "never").
4. Always balance critique with at least one positive or neutral observation.
5. All feedback must reference the user's actual bio text.
6. Do not speculate beyond what the bio states.
7. Always explain WHY a suggestion helps conversation or first impressions.
8. Avoid dating slang ("rizz", "alpha", etc.).
9. Never pressure the user to upgrade or watch ads.
10. Assume users may feel vulnerable — respond with care.

Primary evaluation focus:
• Clarity - Is the bio easy to understand?
• Authenticity - Does it feel genuine?
• Engagement potential - Does it invite conversation?
• Warmth - Does it feel approachable?
• Distinctiveness - Does it stand out?`;

    let userPrompt = '';

    if (tier === 'free') {
      userPrompt = `Review this dating profile bio and provide:
1. A score from 0-100 for "First Impression Score"
2. A short supportive label for the score (e.g., "Friendly and genuine, but not very distinctive yet")
3. 2-3 key observations about what stands out (reference specific parts of the bio)
4. One actionable quick tip they can implement immediately

Bio to review:
"${bioText}"

Respond in JSON format:
{
  "score": number,
  "scoreLabel": "string",
  "keyObservations": ["string", "string"],
  "quickTip": "string"
}`;
    } else if (tier === 'video') {
      userPrompt = `Review this dating profile bio and provide:
1. A score from 0-100 for "First Impression Score"
2. A short supportive label for the score
3. 2-3 key observations about what stands out
4. One actionable quick tip
5. 2-3 deeper insights about tone, engagement potential, and conversational hooks
6. One suggested rewrite of the bio (neutral tone, 2-3 sentences, inviting and memorable)

Bio to review:
"${bioText}"

Respond in JSON format:
{
  "score": number,
  "scoreLabel": "string",
  "keyObservations": ["string", "string"],
  "quickTip": "string",
  "deeperInsights": ["string", "string", "string"],
  "suggestedRewrite": "string"
}`;
    } else if (tier === 'pro') {
      userPrompt = `Review this dating profile bio comprehensively and provide:
1. A score from 0-100 for "First Impression Score"
2. A short supportive label for the score
3. 2-3 key observations about what stands out
4. One actionable quick tip
5. 2-3 deeper insights about tone, engagement potential, and conversational hooks
6. Full breakdown with explanations for: First Impression, Personality Clarity, Engagement Potential, Authenticity, Matchability
7. 4 bio rewrites in different tones: Playful, Warm, Confident, Direct
8. Line-level feedback: identify 2-3 phrases that could be improved, with alternatives and explanations
9. Photo guidance: 3-4 text-based tips about photo order, missing types, and traits to reinforce

Bio to review:
"${bioText}"

Respond in JSON format:
{
  "score": number,
  "scoreLabel": "string",
  "keyObservations": ["string", "string"],
  "quickTip": "string",
  "deeperInsights": ["string", "string", "string"],
  "suggestedRewrite": "string",
  "fullBreakdown": {
    "firstImpression": "string",
    "personalityClarity": "string",
    "engagementPotential": "string",
    "authenticity": "string",
    "matchability": "string"
  },
  "rewrites": [
    { "tone": "Playful", "text": "string" },
    { "tone": "Warm", "text": "string" },
    { "tone": "Confident", "text": "string" },
    { "tone": "Direct", "text": "string" }
  ],
  "lineFeedback": [
    { "original": "string", "suggestion": "string", "reason": "string" }
  ],
  "photoGuidance": ["string", "string", "string"]
}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from the AI
    let result: ProfileReviewResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1] || content;
      result = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in review-profile function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
