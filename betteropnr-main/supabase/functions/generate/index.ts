import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

// OBSERVABILITY: Request correlation + structured logging helpers
function generateRequestId(req: Request): string {
  return req.headers.get('X-Request-Id') || crypto.randomUUID();
}

function maskId(id: string | null | undefined): string {
  if (!id || id.length < 10) return id ?? 'unknown';
  return id.slice(0, 6) + '…' + id.slice(-4);
}

// OBSERVABILITY: In-memory counters (best-effort, reset on cold start)
const metrics = {
  totalRequests: 0,
  guestRequests: 0,
  authRequests: 0,
  success2xx: 0,
  rateLimited429: 0,
  invalidInput400: 0,
  authFailed401_403: 0,
  serverError5xx: 0,
};
const METRICS_LOG_INTERVAL = 50;

function logEvent(evt: Record<string, unknown>): void {
  try { console.log(JSON.stringify(evt)); } catch { /* ignore */ }
}

function maybeLogMetrics(): void {
  if (metrics.totalRequests > 0 && metrics.totalRequests % METRICS_LOG_INTERVAL === 0) {
    logEvent({ type: 'metrics_summary', ...metrics, timestamp: new Date().toISOString() });
  }
}

// GUEST_SECURITY: Strict CORS — allow only our domains and Lovable preview
const ALLOWED_ORIGINS = [
  'https://betteropnr.lovable.app',
  'https://betteropnr.com',
  'https://www.betteropnr.com',
];
// Also allow Lovable preview domains (pattern: *.lovable.app)
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any *.lovable.app subdomain for preview/dev
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.lovable.app');
  } catch {
    return false;
  }
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-guest-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// GUEST_SECURITY: Static fallback headers for functions outside the request handler
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-guest-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// GUEST_SECURITY: Short-term throttle store (per guestKey, 1 req per 10s)
const guestThrottleStore = new Map<string, number>();
const GUEST_THROTTLE_MS = 10000;

// GUEST_SECURITY: Max payload size in bytes (20KB)
const MAX_PAYLOAD_BYTES = 20480;

// GUEST_LIMITS: Server-side constants
const GUEST_DAILY_RUN_LIMIT = 3;
const GUEST_OPENERS_PER_RUN = 2;

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

// GUEST_LIMITS: Derive a privacy-safe guest key via SHA-256 hash
async function deriveGuestKey(req: Request, explicitId?: string): Promise<string> {
  if (explicitId && explicitId.trim().length > 0) {
    // Hash the explicit guest ID for consistency
    const encoded = new TextEncoder().encode(explicitId.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'g_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  }
  // Fallback: hash IP + User-Agent
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  const encoded = new TextEncoder().encode(ip + ua);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'g_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
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
  const cors = getCorsHeaders(req);
  // OBSERVABILITY: Correlation ID + timing
  const requestId = generateRequestId(req);
  const requestStartMs = Date.now();
  const reqOrigin = req.headers.get('Origin') || null;
  // OBSERVABILITY: Track per-request state for final log
  let reqMode: 'auth' | 'guest' = 'auth';
  let reqUserKey = 'unknown';
  let reqStatus = 200;
  let reqErrorCode: string | null = null;
  let reqOpenersReturned = 0;
  let reqGuestRemaining: number | null = null;
  let aiDurationMs: number | null = null;
  let aiProvider: string | null = null;

  metrics.totalRequests++;

  // OBSERVABILITY: Helper to finalize response with X-Request-Id and log
  function finalizeResponse(resp: Response, overrideStatus?: number): Response {
    const status = overrideStatus ?? resp.status;
    reqStatus = status;
    if (status >= 200 && status < 300) metrics.success2xx++;
    else if (status === 400) metrics.invalidInput400++;
    else if (status === 401 || status === 403) metrics.authFailed401_403++;
    else if (status === 429) metrics.rateLimited429++;
    else if (status >= 500) metrics.serverError5xx++;

    const headers = new Headers(resp.headers);
    headers.set('X-Request-Id', requestId);

    logEvent({
      type: 'request_complete',
      timestamp: new Date().toISOString(),
      requestId,
      mode: reqMode,
      userKey: maskId(reqUserKey),
      origin: reqOrigin,
      status: reqStatus,
      errorCode: reqErrorCode,
      durationMs: Date.now() - requestStartMs,
      aiDurationMs,
      aiProviderUsed: aiProvider,
      openersReturned: reqOpenersReturned,
      guestRemainingRunsToday: reqGuestRemaining,
    });
    maybeLogMetrics();

    return new Response(resp.body, { status, headers });
  }

  // GUEST_SECURITY: Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...cors, 'X-Request-Id': requestId } });
  }

  // GUEST_SECURITY: Reject non-POST methods
  if (req.method !== 'POST') {
    reqErrorCode = 'METHOD_NOT_ALLOWED';
    return finalizeResponse(new Response(
      JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are accepted.' }),
      { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } }
    ));
  }

  try {
    // GUEST_SECURITY: Enforce max payload size
    const contentLength = req.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      reqErrorCode = 'INVALID_INPUT';
      return finalizeResponse(new Response(
        JSON.stringify({ error: 'INVALID_INPUT', message: 'Request payload is too large.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      ));
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GUEST_SECURITY: Parse and validate request body
    let requestBody: GenerateRequest;
    try {
      const rawText = await req.text();
      if (rawText.length > MAX_PAYLOAD_BYTES) {
        reqErrorCode = 'INVALID_INPUT';
        return finalizeResponse(new Response(
          JSON.stringify({ error: 'INVALID_INPUT', message: 'Request payload is too large.' }),
          { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
        ));
      }
      requestBody = JSON.parse(rawText);
    } catch {
      reqErrorCode = 'INVALID_INPUT';
      return finalizeResponse(new Response(
        JSON.stringify({ error: 'INVALID_INPUT', message: 'Please provide the required information to generate openers.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      ));
    }

    // Determine if request is authenticated or guest
    const authHeader = req.headers.get('Authorization');
    let userId: string;
    let userPlan = 'free';
    let isGuestRequest = false;
    let guestKey = '';

    if (authHeader && authHeader.trim() !== '') {
      // Authenticated path: verify Clerk JWT
      reqMode = 'auth';
      metrics.authRequests++;
      const authResult = await verifyClerkJWT(req);
      
      if (!authResult.success) {
        console.error('Auth failed:', authResult.error);
        reqErrorCode = 'AUTH_FAILED';
        return finalizeResponse(createAuthErrorResponse(authResult.error, authResult.status, cors));
      }

      userId = authResult.userId;
      reqUserKey = userId;
      console.log('Authenticated user:', userId);

      // Rate limiting using verified userId
      const now = Date.now();
      const userRateLimit = rateLimitStore.get(userId);
      
      if (userRateLimit) {
        if (now < userRateLimit.resetTime) {
          if (userRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
            reqErrorCode = 'RATE_LIMITED';
            return finalizeResponse(new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
              { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
            ));
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
        reqErrorCode = 'USER_FETCH_FAILED';
        return finalizeResponse(new Response(
          JSON.stringify({ error: 'Failed to verify user plan' }),
            { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
        ));
      }

      if (!userData) {
        console.warn('User not found in database. Creating a new user record with free plan:', userId);
        const emailFromAuth = authResult.email;
        const fallbackEmail = `unknown+${userId}@placeholder.invalid`;
        const emailFromBody = (requestBody && typeof requestBody.userEmail === 'string') ? requestBody.userEmail : undefined;
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert({
            clerk_user_id: userId,
            email: emailFromAuth || emailFromBody || fallbackEmail,
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
          reqErrorCode = 'DAILY_LIMIT';
          return finalizeResponse(new Response(
            JSON.stringify({ 
              error: 'Daily limit reached',
              message: 'You have reached your daily limit of 5 openers. Upgrade to Pro for unlimited access.',
              requiresUpgrade: true 
            }),
            { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } }
          ));
        }
      }
    } else {
      // GUEST_LIMITS: Guest path — no auth
      isGuestRequest = true;
      reqMode = 'guest';
      metrics.guestRequests++;
      const xGuestId = req.headers.get('X-Guest-Id') || '';
      guestKey = await deriveGuestKey(req, xGuestId);
      userId = guestKey;
      reqUserKey = guestKey;
      console.log('Guest request, guestKey:', guestKey);

      // GUEST_SECURITY: Short-term throttle — max 1 request per 10s per guest
      const lastReqAt = guestThrottleStore.get(guestKey) || 0;
      const nowMs = Date.now();
      if (nowMs - lastReqAt < GUEST_THROTTLE_MS) {
        reqErrorCode = 'GUEST_TOO_FAST';
        return finalizeResponse(new Response(
          JSON.stringify({ error: 'GUEST_TOO_FAST', message: 'Please wait a moment before generating again.' }),
          { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
        ));
      }
      guestThrottleStore.set(guestKey, nowMs);

      // In-memory rate limiting for guests
      const now = Date.now();
      const guestRateLimit = rateLimitStore.get(guestKey);
      if (guestRateLimit) {
        if (now < guestRateLimit.resetTime) {
          if (guestRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
            reqErrorCode = 'RATE_LIMITED';
            return finalizeResponse(new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
              { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
            ));
          }
          guestRateLimit.count++;
        } else {
          rateLimitStore.set(guestKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        }
      } else {
        rateLimitStore.set(guestKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }

      // GUEST_LIMITS: Server-side daily usage check
      const todayUtc = new Date().toISOString().split('T')[0];
      const { data: guestUsage, error: guestUsageError } = await supabase
        .from('guest_generation_usage')
        .select('runs_used, date_utc')
        .eq('guest_key', guestKey)
        .eq('date_utc', todayUtc)
        .maybeSingle();

      if (guestUsageError) {
        console.error('Error fetching guest usage:', guestUsageError);
      }

      const runsUsed = (guestUsage && guestUsage.date_utc === todayUtc) ? guestUsage.runs_used : 0;

      if (runsUsed >= GUEST_DAILY_RUN_LIMIT) {
        console.log('Guest limit reached for:', guestKey, 'runs:', runsUsed);
        reqErrorCode = 'GUEST_LIMIT_REACHED';
        reqGuestRemaining = 0;
        return finalizeResponse(new Response(
          JSON.stringify({ 
            error: 'GUEST_LIMIT_REACHED',
            message: 'Guest limit reached. Create a free account to continue.',
            guestLimits: buildGuestLimits(runsUsed),
          }),
          { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
        ));
      }
    }

    const { profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle } = requestBody;
    
    console.log('Generate request:', { userId, userPlan, mode, isGuestRequest });

    // Enhanced input validation
    if (!profileText?.trim()) {
      reqErrorCode = 'MISSING_PROFILE';
      return finalizeResponse(new Response(
        JSON.stringify({ error: 'Profile text is required' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      ));
    }

    // Enforce input length limits (increased to 3000 characters)
    if (profileText.length > 3000 || (userProfileText && userProfileText.length > 3000)) {
      reqErrorCode = 'INPUT_TOO_LONG';
      return finalizeResponse(new Response(
        JSON.stringify({ error: 'Profile text is too long. Maximum 3000 characters allowed.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      ));
    }

    // Validate tones array
    const allowedTones = ['playful', 'sincere', 'thoughtful', 'fun', 'flirty', 'bold', 'curious', 'confident', 'funny'];
    if (!tones || tones.length === 0) {
      reqErrorCode = 'MISSING_TONES';
      return finalizeResponse(new Response(
        JSON.stringify({ error: 'At least one tone must be selected' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      ));
    }
    if (tones.length > 4 || !tones.every(tone => allowedTones.includes(tone))) {
      reqErrorCode = 'INVALID_TONES';
      return finalizeResponse(new Response(
        JSON.stringify({ error: 'Invalid tones provided. Maximum 4 allowed tones.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      ));
    }

    // Content filtering
    if (containsBlockedContent(profileText)) {
      reqErrorCode = 'BLOCKED_CONTENT';
      return finalizeResponse(new Response(
        JSON.stringify({ error: 'Content contains inappropriate language. Please revise.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      ));
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      const fallbackResult = fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle, isGuestRequest);
      // GUEST_LIMITS_SYNC: Increment usage on successful fallback for guests and attach guestLimits
      if (isGuestRequest) {
        const newUsed = await incrementGuestUsage(supabase, guestKey);
        const injected = await injectGuestLimits(fallbackResult, newUsed);
        if (newUsed >= 0) reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
        return finalizeResponse(injected);
      }
      return finalizeResponse(fallbackResult);
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

    // GUEST_LIMITS: Guest gets exactly 2 openers, authenticated gets 4
    const openerCount = isGuestRequest ? GUEST_OPENERS_PER_RUN : 4;

    const userPrompt = mode === 'opener'
      ? `${profileContext}\n\nWrite ${openerCount} unique, natural conversation openers. Sound like a real person who noticed something interesting and wants to chat about it. Be ${tones.join(', ')} - but authentic, not trying too hard.${variationInstruction}${commonInterestHint}\n\nDon't copy exact words from their profile. Paraphrase naturally. Write like you're genuinely texting someone.\n\nReturn ONLY a JSON array of ${openerCount} strings, no other text.`
      : theirReply
        ? `${profileContext}\n\nMy message: "${priorMessage}"\nTheir reply: "${theirReply}"\n\nWrite 3-5 natural follow-up messages. React to what they said like a real person would, add your take, and keep the conversation flowing. Be ${tones.join(', ')}.${variationInstruction}${commonInterestHint}\n\nReturn ONLY a JSON array of strings, no other text.`
        : `${profileContext}\n\nMy last message: "${priorMessage}"\n\nThey went quiet 24-48h ago. Write 3-5 light, casual messages to re-engage without being pushy. Be ${tones.join(', ')}.${variationInstruction}\n\nReturn ONLY a JSON array of strings, no other text.`;

    // OBSERVABILITY: Track AI call timing
    aiProvider = 'google/gemini-2.5-flash';
    const aiStartMs = Date.now();

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
      aiDurationMs = Date.now() - aiStartMs;
      console.log('AI API response status:', response.status);
    } catch (error) {
      clearTimeout(timeoutId);
      aiDurationMs = Date.now() - aiStartMs;
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('AI request was aborted due to timeout');
        return finalizeResponse(fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle, isGuestRequest));
      }
      console.error('AI request failed:', error);
      return finalizeResponse(fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle, isGuestRequest));
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        reqErrorCode = 'AI_RATE_LIMIT';
        return finalizeResponse(new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
        ));
      }
      
      if (response.status === 402) {
        reqErrorCode = 'AI_CREDITS';
        return finalizeResponse(new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...cors, 'Content-Type': 'application/json' } }
        ));
      }
      
      // Fall back to template generation on AI error
      const fallbackResult = fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle, isGuestRequest);
      if (isGuestRequest) {
        const newUsed = await incrementGuestUsage(supabase, guestKey);
        const injected = await injectGuestLimits(fallbackResult, newUsed);
        if (newUsed >= 0) reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
        return finalizeResponse(injected);
      }
      return finalizeResponse(fallbackResult);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return finalizeResponse(fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle, isGuestRequest));
    }

    // Parse the JSON array from the response
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      let results = JSON.parse(cleanContent);
      
      if (Array.isArray(results) && results.length > 0) {
        // Enforce max length and filter inappropriate content
        let filteredResults = results
          .map((text: string) => enforceMaxLength(text))
          .filter((text: string) => !containsBlockedContent(text));

        // GUEST_LIMITS: Enforce output size for guests
        if (isGuestRequest) {
          filteredResults = filteredResults.slice(0, GUEST_OPENERS_PER_RUN);
        }
        
        if (filteredResults.length > 0) {
          console.log('Successfully generated', filteredResults.length, 'results');
          reqOpenersReturned = filteredResults.length;

          // GUEST_LIMITS_SYNC: Increment usage and include guestLimits in response
          let responsePayload: any = { results: filteredResults };
          if (isGuestRequest) {
            const newUsed = await incrementGuestUsage(supabase, guestKey);
            if (newUsed >= 0) {
              responsePayload.guestLimits = buildGuestLimits(newUsed);
              reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
            }
          }

          return finalizeResponse(new Response(
            JSON.stringify(responsePayload),
            { headers: { ...cors, 'Content-Type': 'application/json' } }
          ));
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
    }

    // Fall back if parsing failed
    const fallbackResult = fallbackGeneration(profileText, userProfileText, tones, mode, priorMessage, theirReply, variationStyle, isGuestRequest);
    if (isGuestRequest) {
      const newUsed = await incrementGuestUsage(supabase, guestKey);
      const injected = await injectGuestLimits(fallbackResult, newUsed);
      if (newUsed >= 0) reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
      return finalizeResponse(injected);
    }
    return finalizeResponse(fallbackResult);

  } catch (error) {
    // GUEST_SECURITY: Never leak technical errors
    console.error('Error in generate function:', error);
    reqErrorCode = 'SERVER_ERROR';
    return finalizeResponse(new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    ));
  }
});

// GUEST_LIMITS_SYNC: Increment guest daily run counter and return new runs_used
async function incrementGuestUsage(supabase: any, guestKey: string): Promise<number> {
  const todayUtc = new Date().toISOString().split('T')[0];
  try {
    const { data: existing } = await supabase
      .from('guest_generation_usage')
      .select('runs_used')
      .eq('guest_key', guestKey)
      .eq('date_utc', todayUtc)
      .maybeSingle();

    const newUsed = existing ? existing.runs_used + 1 : 1;

    if (existing) {
      await supabase
        .from('guest_generation_usage')
        .update({ runs_used: newUsed, updated_at: new Date().toISOString() })
        .eq('guest_key', guestKey)
        .eq('date_utc', todayUtc);
    } else {
      await supabase
        .from('guest_generation_usage')
        .insert({ guest_key: guestKey, date_utc: todayUtc, runs_used: 1 });
    }
    console.log('Guest usage incremented for:', guestKey, 'date:', todayUtc, 'newUsed:', newUsed);
    return newUsed;
  } catch (e) {
    console.error('Failed to increment guest usage:', e);
    return -1; // unknown
  }
}

// GUEST_LIMITS_SYNC: Build guestLimits payload
function buildGuestLimits(runsUsed: number): { remainingRunsToday: number; resetDateUtc: string } {
  const resetDateUtc = new Date().toISOString().split('T')[0];
  return {
    remainingRunsToday: Math.max(0, GUEST_DAILY_RUN_LIMIT - runsUsed),
    resetDateUtc,
  };
}

// GUEST_LIMITS_SYNC: Inject guestLimits into an existing Response (for fallback paths)
async function injectGuestLimits(resp: Response, newUsed: number): Promise<Response> {
  if (newUsed < 0) return resp; // unknown usage, skip
  try {
    const body = await resp.json();
    body.guestLimits = buildGuestLimits(newUsed);
    return new Response(JSON.stringify(body), {
      status: resp.status,
      headers: resp.headers,
    });
  } catch {
    return resp;
  }
}

function fallbackGeneration(
  profileText: string,
  userProfileText: string | undefined,
  tones: string[],
  mode: 'opener' | 'followup',
  priorMessage?: string,
  theirReply?: string,
  variationStyle?: string,
  isGuest?: boolean
): Response {
  console.log('Using fallback template generation');
  
  if (mode === 'followup') {
    if (!theirReply) {
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
  
  // GUEST_LIMITS: Limit fallback results for guests
  const count = isGuest ? GUEST_OPENERS_PER_RUN : 4;
  const results = conversationTemplates.slice(0, count).map(template => {
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
