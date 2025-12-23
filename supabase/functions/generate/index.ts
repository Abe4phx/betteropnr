import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (in-memory, resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

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
  userEmail?: string;
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
    // Verify JWT and extract user ID
    const authResult = await verifyClerkJWT(req);
    
    if ('error' in authResult) {
      console.error('Auth failed:', authResult.error);
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    const userId = authResult.userId;
    console.log('Authenticated user:', userId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestBody = await req.json();

    // Rate limiting using verified userId
    const now = Date.now();
    const userRateLimit = rateLimitStore.get(userId);
    
    if (userRateLimit) {
      if (now < userRateLimit.resetTime) {
        if (userRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        userRateLimit.count++;
      } else {
        rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Get user's plan and check usage limits
    console.log('Fetching user plan for:', userId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan, clerk_user_id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user plan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let userPlan = 'free';
    if (!userData) {
      console.warn('User not found in database. Creating a new user record with free plan:', userId);
      const emailFromAuth = authResult.email;
      const emailFromClient = (requestBody && typeof requestBody.userEmail === 'string') ? requestBody.userEmail : undefined;
      const fallbackEmail = `unknown+${userId}@placeholder.invalid`;
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: emailFromAuth || emailFromClient || fallbackEmail,
          username: 'User',
          plan: 'free',
        })
        .select('plan, clerk_user_id')
        .maybeSingle();

      if (insertError) {
        console.error('Failed to auto-create user. Proceeding with free plan:', insertError);
        userPlan = 'free';
      } else {
        userPlan = inserted?.plan || 'free';
      }
    } else {
      userPlan = userData.plan || 'free';
    }
    console.log('User plan:', userPlan);

    // Check usage limits for free users
    if (userPlan === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('openers_generated')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (usageError) {
        console.error('Error fetching usage:', usageError);
      }

      const openersGenerated = usageData?.openers_generated || 0;
      const FREE_PLAN_LIMIT = 5;

      if (openersGenerated >= FREE_PLAN_LIMIT) {
        return new Response(
          JSON.stringify({ 
            error: 'Daily limit reached',
            message: 'You have reached your daily limit of 5 openers. Upgrade to Pro for unlimited access.',
            requiresUpgrade: true 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle }: GenerateRequest = requestBody;
    
    console.log('Generate request:', { userId, userPlan, mode });

    // Enhanced input validation
    if (!profileText?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Profile text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enforce input length limits (increased to 3000 characters)
    if (profileText.length > 3000 || (userProfileText && userProfileText.length > 3000)) {
      return new Response(
        JSON.stringify({ error: 'Profile text is too long. Maximum 3000 characters allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate tones array
    const allowedTones = ['playful', 'sincere', 'thoughtful', 'fun', 'flirty', 'bold', 'curious', 'confident', 'funny'];
    if (!tones || tones.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one tone must be selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (tones.length > 4 || !tones.every(tone => allowedTones.includes(tone))) {
      return new Response(
        JSON.stringify({ error: 'Invalid tones provided. Maximum 4 allowed tones.' }),
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
      ? `You are a real person writing a natural dating app message, not a bot. Your goal: Write messages that sound genuinely conversational and spontaneous - like you noticed something interesting and are casually reaching out.

CRITICAL RULES:
- Never directly quote or copy phrases from their profile
- Paraphrase interests naturally, like you're describing what caught your attention
- Write like you're texting a friend, not crafting a formal message
- Use casual language, contractions, and natural speech patterns
- Keep it specific enough to show you read their profile, but loose enough to feel human
- Avoid formulaic patterns like "I saw you like X" or "Your profile mentioned Y"
- Instead, reference things indirectly: "So you're into hiking?" rather than "I noticed hiking in your profile"
- Match the tone (${tones.join('/')}) but keep it feeling authentic and unforced${variationInstruction}${commonInterestHint}
- Length: Under ${MAX_OPENER_LENGTH} characters
- No pickup lines, generic openers, or anything inappropriate

Think: How would YOU actually text someone you find interesting? That's the vibe.`
      : theirReply
        ? `You're a real person continuing a natural dating app conversation, not a bot. Write follow-up messages that feel like genuine, flowing conversation.

CRITICAL RULES:
- Acknowledge their reply in a natural, conversational way (not formal)
- Don't echo their exact words back - paraphrase or react naturally
- Add your own perspective or quick reaction that feels personal and real
- Ask a specific follow-up question that keeps the conversation going
- If appropriate, casually suggest a low-key meetup (coffee, walk, etc.)
- Match tone (${tones.join('/')}) but sound like a real person texting${variationInstruction}${commonInterestHint}
- Keep under 200 characters
- Avoid sounding scripted or too polished - embrace casual imperfection

Think: How would you naturally respond if you were excited about their reply?`
        : `You're a real person gently re-engaging after a dating app conversation stalled, not a bot. Write messages that are light, non-needy, and feel genuinely casual.

CRITICAL RULES:
- Reference the previous conversation naturally without being weird about the gap
- Be playful and low-pressure - never guilt-trip or seem desperate
- Sound like you just remembered something fun about your chat
- Keep it short, breezy, and easy to respond to
- Match tone (${tones.join('/')})${variationInstruction}
- Keep under 150 characters
- No "just checking in" or "hope you're well" - too formal

Think: What would you actually send if you wanted to casually revive a fun chat?`;

    const userPrompt = mode === 'opener'
      ? `${profileContext}\n\nWrite 4 unique, natural conversation openers. Sound like a real person who noticed something interesting and wants to chat about it. Be ${tones.join(', ')} - but authentic, not trying too hard.${variationInstruction}${commonInterestHint}\n\nDon't copy exact words from their profile. Paraphrase naturally. Write like you're genuinely texting someone.\n\nReturn ONLY a JSON array of 4 strings, no other text.`
      : theirReply
        ? `${profileContext}\n\nMy message: "${priorMessage}"\nTheir reply: "${theirReply}"\n\nWrite 3-5 natural follow-up messages. React to what they said like a real person would, add your take, and keep the conversation flowing. Be ${tones.join(', ')}.${variationInstruction}${commonInterestHint}\n\nReturn ONLY a JSON array of strings, no other text.`
        : `${profileContext}\n\nMy last message: "${priorMessage}"\n\nThey went quiet 24-48h ago. Write 3-5 light, casual messages to re-engage without being pushy. Be ${tones.join(', ')}.${variationInstruction}\n\nReturn ONLY a JSON array of strings, no other text.`;

    // Call Lovable AI with timeout protection
    console.log('Calling Lovable AI API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('AI request timed out after 25 seconds');
      controller.abort();
    }, 25000);

    let response;
    try {
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
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
      clearTimeout(timeoutId);
      console.log('AI API response status:', response.status);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('AI request was aborted due to timeout');
        return fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle);
      }
      console.error('AI request failed:', error);
      return fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle);
    }

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
      JSON.stringify({ error: 'An error occurred while processing your request' }),
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
        "Random thought: still thinking about what you said. Any updates?",
        "Okay but I need to know the verdict on that thing we discussed 👀",
        "Plot twist: I'm back. What's new with you?",
      ];
      return new Response(
        JSON.stringify({ results: reEngagementTemplates }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Follow-up templates when they replied
    const followUpTemplates = [
      "Ha! That's actually really interesting. What made you think of that?",
      "Wait, tell me more about that part!",
      "Okay now I'm curious - what's the story behind that?",
      "Love that take. So what's next on your radar?",
      "That tracks honestly. Wanna grab coffee and discuss?",
    ];
    return new Response(
      JSON.stringify({ results: followUpTemplates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Extract interests from profile text
  const interests = profileText.toLowerCase()
    .split(/[,.\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 3 && s.length < 30)
    .slice(0, 3);
  
  const interest = interests[0] || 'that';
  const primaryTone = tones[0] || 'playful';
  const adjectives = toneAdjectives[primaryTone] || toneAdjectives.playful;
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  const results = conversationTemplates.slice(0, 4).map(template => {
    return template
      .replace('{interest}', interest)
      .replace('{adjective}', adjective)
      .replace('{quirkyEitherOr}', quirkyEitherOr[Math.floor(Math.random() * quirkyEitherOr.length)]);
  });
  
  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
