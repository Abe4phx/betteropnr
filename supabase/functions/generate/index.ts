import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  profileText: string;
  tones: string[];
  mode: 'opener' | 'followup';
  priorMessage?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileText, tones, mode, priorMessage }: GenerateRequest = await req.json();
    
    console.log('Generate request:', { profileText, tones, mode, priorMessage });

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      // Fall back to template generation
      return fallbackGeneration(profileText, tones, mode, priorMessage);
    }

    // Build the system prompt
    const systemPrompt = mode === 'opener'
      ? `You are TalkSpark — a witty but respectful conversation starter. Use the person's stated interests. Be specific, ask one engaging question, and match the selected tones (${tones.join('/')}). Avoid generic greetings or pickup lines. Keep under 200 characters.`
      : `You are TalkSpark — generate follow-up questions based on the previous message. Be engaging and show genuine interest. Match the selected tones (${tones.join('/')}). Keep under 150 characters.`;

    const userPrompt = mode === 'opener'
      ? `Generate 4 unique conversation openers for someone with these interests: ${profileText}. Make them ${tones.join(', ')}. Return ONLY a JSON array of strings, no other text.`
      : `The previous message was: "${priorMessage}". Generate 3 follow-up questions about this topic for someone with these interests: ${profileText}. Make them ${tones.join(', ')}. Return ONLY a JSON array of strings, no other text.`;

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
      return fallbackGeneration(profileText, tones, mode, priorMessage);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return fallbackGeneration(profileText, tones, mode, priorMessage);
    }

    // Parse the JSON array from the response
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const results = JSON.parse(cleanContent);
      
      if (Array.isArray(results) && results.length > 0) {
        console.log('Successfully generated', results.length, 'results');
        return new Response(
          JSON.stringify({ results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
    }

    // Fall back if parsing failed
    return fallbackGeneration(profileText, tones, mode, priorMessage);

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
  tones: string[],
  mode: 'opener' | 'followup',
  priorMessage?: string
): Response {
  console.log('Using fallback template generation');
  
  const templates: Record<string, string[]> = {
    playful: [
      `What's the most spontaneous thing related to ${profileText} you've done?`,
      `If you could turn ${profileText} into a game, what would it be?`,
      `Tell me a fun story about ${profileText}!`,
    ],
    sincere: [
      `What drew you to ${profileText} in the first place?`,
      `How has ${profileText} impacted your life?`,
      `What do you find most meaningful about ${profileText}?`,
    ],
    confident: [
      `I'd love to hear about your experience with ${profileText}.`,
      `What's your take on ${profileText}?`,
      `You seem passionate about ${profileText} - what drives that?`,
    ],
    funny: [
      `If ${profileText} was a superhero, what would be its power?`,
      `What's the weirdest thing about ${profileText} that people don't talk about?`,
      `Be honest - have you ever had a disaster involving ${profileText}?`,
    ],
  };

  const followupTemplates = [
    "That's fascinating! Can you tell me more?",
    "What got you interested in that?",
    "How long have you been into that?",
    "That sounds amazing! What do you love most about it?",
  ];

  if (mode === 'followup') {
    return new Response(
      JSON.stringify({ results: followupTemplates.slice(0, 3) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const results: string[] = [];
  for (const tone of tones.slice(0, 4)) {
    const toneTemplates = templates[tone] || templates.playful;
    const template = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
    results.push(template);
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
