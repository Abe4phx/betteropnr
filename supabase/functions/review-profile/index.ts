import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

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
  subScores?: {
    firstImpressionClarity: number;
    personalityAuthenticity: number;
    engagementPotential: number;
    toneWarmth: number;
    distinctiveness: number;
  };
  scoreLabel: string;
  keyObservations: string[];
  quickTip: string;
  // Video unlock extras
  deeperInsights?: string[];
  suggestedRewrite?: string;
  // Pro extras
  fullBreakdown?: {
    firstImpression: { score: number; explanation: string; feedback: string };
    personalityClarity: { score: number; explanation: string; feedback: string };
    engagementPotential: { score: number; explanation: string; feedback: string };
    toneWarmth: { score: number; explanation: string; feedback: string };
    distinctiveness: { score: number; explanation: string; feedback: string };
  };
  rewrites?: { tone: string; text: string; intent?: string }[];
  lineFeedback?: { original: string; suggestion: string; reason: string }[];
  photoGuidance?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT - this function requires authentication
    const authResult = await verifyClerkJWT(req);
    
    if ('error' in authResult) {
      console.error('Auth failed:', authResult.error);
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    console.log('Authenticated user for profile review:', authResult.userId);

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
      userPrompt = `Review this dating profile bio using the weighted scoring model below.

SCORING MODEL (calculate ALL sub-scores internally, DO NOT reveal them):
1) First Impression Clarity (0–25): How quickly a stranger understands who they are.
2) Personality & Authenticity (0–20): How human and specific the bio feels.
3) Engagement Potential (0–25, highest priority): How easily someone could start a conversation.
4) Tone & Warmth (0–15): Emotional openness and positivity.
5) Distinctiveness (0–15): How memorable the bio is.

Sum the sub-scores for the total (0-100). Identify which dimension scored LOWEST internally.

OUTPUT REQUIREMENTS:
1. Total score (0-100) with a supportive summary sentence. Example: "Friendly and genuine, but not very distinctive yet."
2. Exactly 2-3 observations:
   - Each must map to a specific scoring dimension
   - Must reference the user's ACTUAL bio text in quotes
   - Observational tone, never judgmental
3. Exactly ONE actionable tip:
   - Must target the LOWEST-scoring dimension
   - Must be immediately usable
   - Must explain WHY it helps first impressions or conversation

Bio to review:
"${bioText}"

Respond in JSON format:
{
  "score": number,
  "scoreLabel": "string (supportive summary)",
  "keyObservations": ["string", "string", "string"],
  "quickTip": "string"
}`;
    } else if (tier === 'video') {
      userPrompt = `Review this dating profile bio using the weighted scoring model below.

SCORING MODEL (calculate ALL sub-scores internally, DO NOT reveal them):
1) First Impression Clarity (0–25): How quickly a stranger understands who they are.
2) Personality & Authenticity (0–20): How human and specific the bio feels.
3) Engagement Potential (0–25, highest priority): How easily someone could start a conversation.
4) Tone & Warmth (0–15): Emotional openness and positivity.
5) Distinctiveness (0–15): How memorable the bio is.

Sum the sub-scores for the total (0-100). Identify which dimension scored LOWEST internally.

OUTPUT REQUIREMENTS:
1. Total score (0-100) with a supportive summary sentence.
2. Exactly 2-3 observations (must reference actual bio text, map to scoring dimensions).
3. Exactly ONE actionable tip targeting the lowest-scoring dimension.
4. Exactly 2-3 deeper insights:
   - High-level explanations about tone, engagement potential, conversational hooks
   - NO numeric sub-scores
   - NO line-by-line critique
   - Fresh observations, do NOT repeat the key observations
5. Exactly ONE rewritten bio:
   - Neutral tone only (no playful/confident variants)
   - 2-3 sentences maximum
   - Must improve engagement + warmth
   - Must feel inviting and memorable

Bio to review:
"${bioText}"

Respond in JSON format:
{
  "score": number,
  "scoreLabel": "string",
  "keyObservations": ["string", "string", "string"],
  "quickTip": "string",
  "deeperInsights": ["string", "string", "string"],
  "suggestedRewrite": "string"
}`;
    } else if (tier === 'pro') {
      userPrompt = `Review this dating profile bio comprehensively for a Premium user.

SCORING MODEL (expose ALL sub-scores for Premium):
1) First Impression Clarity (0–25): How quickly a stranger understands who they are.
2) Personality & Authenticity (0–20): How human and specific the bio feels.
3) Engagement Potential (0–25, highest priority): How easily someone could start a conversation.
4) Tone & Warmth (0–15): Emotional openness and positivity.
5) Distinctiveness (0–15): How memorable the bio is.

OUTPUT REQUIREMENTS:

1. SECTION-BY-SECTION BREAKDOWN
For each of the 5 dimensions, provide:
- The numeric sub-score
- A brief explanation of what it measures
- Supportive feedback tied to the user's actual bio text (quote specific phrases)

2. MULTIPLE REWRITES (4 total)
Generate 4 rewritten bios, each with a distinct tone:
- Playful: Light, fun, shows humor
- Warm: Friendly, approachable, emotionally open
- Confident: Self-assured, direct about qualities
- Direct: Clear, no-nonsense, efficient
Each rewrite must:
- Be 2-4 sentences max
- Improve engagement and clarity
- Stay authentic to original content
- Include a one-line explanation of the rewrite's intent

3. LINE-LEVEL FEEDBACK (2-3 items)
- Identify specific phrases that feel generic or self-focused
- Suggest alternative phrasing
- Explain WHY the change improves replies

4. PHOTO GUIDANCE (3-4 tips, text-based only)
- Recommend which type of photo should be first
- Identify missing photo types (action shots, with friends, travel, etc.)
- Suggest what traits photos should reinforce based on the bio

DO NOT:
- Suggest deception or exaggeration
- Use attractiveness judgments
- Compare to other profiles

Bio to review:
"${bioText}"

Respond in JSON format:
{
  "score": number,
  "subScores": {
    "firstImpressionClarity": number,
    "personalityAuthenticity": number,
    "engagementPotential": number,
    "toneWarmth": number,
    "distinctiveness": number
  },
  "scoreLabel": "string",
  "keyObservations": ["string", "string", "string"],
  "quickTip": "string",
  "deeperInsights": ["string", "string", "string"],
  "fullBreakdown": {
    "firstImpression": { "score": number, "explanation": "string", "feedback": "string" },
    "personalityClarity": { "score": number, "explanation": "string", "feedback": "string" },
    "engagementPotential": { "score": number, "explanation": "string", "feedback": "string" },
    "toneWarmth": { "score": number, "explanation": "string", "feedback": "string" },
    "distinctiveness": { "score": number, "explanation": "string", "feedback": "string" }
  },
  "rewrites": [
    { "tone": "Playful", "text": "string", "intent": "string" },
    { "tone": "Warm", "text": "string", "intent": "string" },
    { "tone": "Confident", "text": "string", "intent": "string" },
    { "tone": "Direct", "text": "string", "intent": "string" }
  ],
  "lineFeedback": [
    { "original": "string", "suggestion": "string", "reason": "string" }
  ],
  "photoGuidance": ["string", "string", "string", "string"]
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
