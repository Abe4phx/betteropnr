import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Content filter for explicit or inappropriate content
const BLOCKED_WORDS = [
  'explicit', 'sexual', 'racist', 'hate', 'violent', 'abuse',
  'offensive', 'inappropriate', 'nsfw', 'porn', 'drug'
];

const MAX_OPENER_LENGTH = 220;

function containsBlockedContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_WORDS.some(word => lowerText.includes(word));
}

function enforceMaxLength(text: string): string {
  if (text.length <= MAX_OPENER_LENGTH) return text;
  return text.substring(0, MAX_OPENER_LENGTH - 3) + '...';
}

interface GenerateRequest {
  profileText: string;
  userProfileText?: string;
  tones: string[];
  mode: 'opener' | 'followup';
  priorMessage?: string;
  theirReply?: string;
  variationStyle?: 'safer' | 'warmer' | 'funnier' | 'shorter';
}

// Template system for fallback generation
const quirkyEitherOr = [
  "Coffee or tea?",
  "Mountains or beaches?",
  "Dogs or cats?",
  "Morning person or night owl?",
  "Books or movies?",
  "Pizza or tacos?",
];

const conversationTemplates = [
  "You mentioned {interest}. What's the most {adjective} thing about it?",
  "As a fellow {interest} enthusiast, I need to know: what got you started?",
  "Quick question: {quirkyEitherOr}. What's your pick and why?",
  "I noticed {interest} in your profile. What's your hot take on it?",
  "So... {interest}. If you could only do it one way, how would you?",
  "Real talk about {interest}: what's something most people get wrong?",
  "Your {interest} background is intriguing. What's the best part nobody talks about?",
  "Challenge: describe {interest} in three words. Go!",
];

const toneAdjectives: Record<string, string[]> = {
  playful: ["fun", "unexpected", "quirky", "wild", "random"],
  sincere: ["meaningful", "profound", "genuine", "heartfelt", "authentic"],
  confident: ["impressive", "unique", "defining", "standout", "signature"],
  funny: ["hilarious", "absurd", "chaotic", "ridiculous", "bizarre"],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle }: GenerateRequest = await req.json();
    
    console.log('Generate request:', { profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle });

    // Validate inputs
    if (!profileText?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Profile text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tones || tones.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one tone must be selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Content filtering
    if (containsBlockedContent(profileText)) {
      return new Response(
        JSON.stringify({ error: 'Content contains inappropriate language. Please revise.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      // Fall back to template generation
      return fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle);
    }

    // Build variation-specific instructions
    let variationInstruction = '';
    if (variationStyle === 'safer') {
      variationInstruction = ' Make it more appropriate, polite, and professional.';
    } else if (variationStyle === 'warmer') {
      variationInstruction = ' Make it more friendly, kind, and emotionally warm.';
    } else if (variationStyle === 'funnier') {
      variationInstruction = ' Make it more humorous, witty, and playful.';
    } else if (variationStyle === 'shorter') {
      variationInstruction = ' Make it significantly shorter and more concise (under 120 characters).';
    }

    // Build context with both profiles
    const profileContext = userProfileText?.trim() 
      ? `Their interests: ${profileText}\nYour interests: ${userProfileText}`
      : `Their interests: ${profileText}`;

    const commonInterestHint = userProfileText?.trim()
      ? ' When possible, find common ground between their interests and yours to create natural connections.'
      : '';

    // Build the system prompt
    const systemPrompt = mode === 'opener'
      ? `You are TalkSpark — a witty but respectful conversation starter. Use the person's stated interests. Be specific, ask one engaging question, and match the selected tones (${tones.join('/')}).${variationInstruction}${commonInterestHint} Avoid generic greetings or pickup lines. CRITICAL: Keep under ${MAX_OPENER_LENGTH} characters. No inappropriate, explicit, or offensive content.`
      : theirReply
        ? `You are TalkSpark — generate follow-up messages that: 1) Acknowledge what they said, 2) Add a small personal tidbit or observation, 3) Ask a specific next question, 4) Optionally bridge to a low-pressure meetup (coffee/walk). Match tones (${tones.join('/')}).${variationInstruction}${commonInterestHint} Keep under 200 characters.`
        : `You are TalkSpark — the chat has stalled. Generate light, fun re-engagement lines after 24-48h. Be non-needy, playful, and reference the previous conversation. Match tones (${tones.join('/')}).${variationInstruction} Keep under 150 characters.`;

    const userPrompt = mode === 'opener'
      ? `${profileContext}\n\nGenerate 4 unique conversation openers. Make them ${tones.join(', ')}.${variationInstruction}${commonInterestHint} Return ONLY a JSON array of strings, no other text.`
      : theirReply
        ? `${profileContext}\n\nMy previous message: "${priorMessage}". Their reply: "${theirReply}". Generate 3-5 follow-up messages. Make them ${tones.join(', ')}.${variationInstruction}${commonInterestHint} Return ONLY a JSON array of strings, no other text.`
        : `${profileContext}\n\nMy previous message was: "${priorMessage}". They haven't replied in 24-48h. Generate 3-5 light re-engagement messages. Make them ${tones.join(', ')}.${variationInstruction} Return ONLY a JSON array of strings, no other text.`;

    // Call Lovable AI
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
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Fall back to template generation on AI error
      return fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle);
    }

    // Parse the JSON array from the response
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const results = JSON.parse(cleanContent);
      
      if (Array.isArray(results) && results.length > 0) {
        // Enforce max length and filter inappropriate content
        const filteredResults = results
          .map(text => enforceMaxLength(text))
          .filter(text => !containsBlockedContent(text));
        
        if (filteredResults.length > 0) {
          console.log('Successfully generated', filteredResults.length, 'results');
          return new Response(
            JSON.stringify({ results: filteredResults }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
    }

    // Fall back if parsing failed
    return fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle);

  } catch (error) {
    console.error('Error in generate function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function fallbackGeneration(
  profileText: string,
  userProfileText: string | undefined,
  tones: string[],
  mode: 'opener' | 'followup',
  priorMessage?: string,
  theirReply?: string,
  variationStyle?: string
): Response {
  console.log('Using fallback template generation');
  
  if (mode === 'followup') {
    if (!theirReply) {
      // Re-engagement templates for stalled conversations
      const reEngagementTemplates = [
        "Hey! Just remembered our chat about that. How'd it go?",
        "Random thought: we never finished that conversation! Still curious...",
        "Been thinking about what you said. Quick question...",
        "No pressure, but I'm still curious about that thing you mentioned!",
        "Hope you're doing well! Still want to hear more about that sometime.",
        "Hey! Did you ever figure out that thing we were talking about?",
      ];
      
      return new Response(
        JSON.stringify({ results: reEngagementTemplates.slice(0, 3) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Standard follow-up templates with acknowledgment and next steps
    const followUpTemplates = [
      "That's fascinating! I actually have some experience with that too. What do you love most about it?",
      "Oh interesting! I've been wanting to try that. What would you recommend for a beginner?",
      "That sounds amazing! I'm curious — how did you first get into that?",
      "Love that! I find it interesting too. Want to grab coffee sometime and chat more about it?",
      "That's cool! I have a friend who's into that as well. What's been your biggest surprise so far?",
      "Nice! I've always wondered about that. Any fun stories you can share?",
    ];
    
    return new Response(
      JSON.stringify({ results: followUpTemplates.slice(0, 3) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Extract interests from profile
  const interests = profileText
    .toLowerCase()
    .split(/[,;.\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 3 && s.length < 30);
  
  const primaryInterest = interests[0] || "your interests";
  
  const results: string[] = [];
  
  for (let i = 0; i < Math.min(4, tones.length); i++) {
    const tone = tones[i];
    const template = conversationTemplates[Math.floor(Math.random() * conversationTemplates.length)];
    const adjectives = toneAdjectives[tone] || toneAdjectives.playful;
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const eitherOr = quirkyEitherOr[Math.floor(Math.random() * quirkyEitherOr.length)];
    
    const result = template
      .replace(/{interest}/g, primaryInterest)
      .replace(/{adjective}/g, adjective)
      .replace(/{quirkyEitherOr}/g, eitherOr);
    
    results.push(result);
  }

  // Apply max length and content filtering to fallback results
  const filteredResults = results
    .map(text => enforceMaxLength(text))
    .filter(text => !containsBlockedContent(text));

  return new Response(
    JSON.stringify({ results: filteredResults }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
