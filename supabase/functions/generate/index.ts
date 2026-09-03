import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import {
  verifyClerkJWT,
  createAuthErrorResponse,
} from "../_shared/clerkAuth.ts";

// OBSERVABILITY: Request correlation + structured logging helpers
function generateRequestId(req: Request): string {
  return req.headers.get("X-Request-Id") || crypto.randomUUID();
}

function maskId(id: string | null | undefined): string {
  if (!id || id.length < 10) return id ?? "unknown";
  return id.slice(0, 6) + "…" + id.slice(-4);
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
  try {
    console.log(JSON.stringify(evt));
  } catch {
    /* ignore */
  }
}

function maybeLogMetrics(): void {
  if (
    metrics.totalRequests > 0 &&
    metrics.totalRequests % METRICS_LOG_INTERVAL === 0
  ) {
    logEvent({
      type: "metrics_summary",
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }
}

// GUEST_SECURITY: Strict CORS — allow only our domains and Lovable preview
const ALLOWED_ORIGINS = [
  "https://betteropnr.lovable.app",
  "https://betteropnr.com",
  "https://www.betteropnr.com",
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "https://localhost",
];
// Also allow Lovable preview domains (pattern: *.lovable.app)
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any *.lovable.app subdomain for preview/dev
  try {
    const url = new URL(origin);
    return url.hostname.endsWith(".lovable.app");
  } catch {
    return false;
  }
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-guest-id, x-request-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

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
  "explicit",
  "sexual",
  "racist",
  "hate",
  "violent",
  "abuse",
  "offensive",
  "inappropriate",
  "nsfw",
  "porn",
  "drug",
];

// Cliche/lazy-opener phrases that indicate generic, non-specific writing.
// CONTENT_FILTER: kept intentionally narrow — each entry here is a
// dating-app-specific cliché with low risk of appearing inside a genuinely
// personalized message. Broader English phrase fragments ("what's your
// favorite", "if you could", "hey there", "how's it going") were removed:
// they're common enough to legitimately open a specific, personalized
// question (e.g. "what's your favorite trail?") and were rejecting
// otherwise-good, on-topic openers purely for containing an ordinary
// greeting or question stem.
const BANNED_OPENER_PHRASES = [
  "pizza or taco",
  "tacos or pizza",
  "dogs or cats",
  "cats or dogs",
  "coffee or tea",
  "beach or mountains",
  "mountains or beach",
  "what's your type",
  "netflix and chill",
  "swipe right",
  "you had me at",
  "are you a magician",
  "asking for a friend",
  "just checking in",
  "hope you're well",
  "what do you do for fun",
  "tell me about yourself",
];

const MAX_OPENER_LENGTH = 220;

function containsBlockedContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => lowerText.includes(word));
}

function containsBannedPhrase(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_OPENER_PHRASES.some((phrase) => lowerText.includes(phrase));
}

function enforceMaxLength(text: string): string {
  if (text.length <= MAX_OPENER_LENGTH) return text;
  return text.substring(0, MAX_OPENER_LENGTH - 3) + "...";
}

// GUEST_LIMITS: Derive a privacy-safe guest key via SHA-256 hash
async function deriveGuestKey(
  req: Request,
  explicitId?: string,
): Promise<string> {
  if (explicitId && explicitId.trim().length > 0) {
    // Hash the explicit guest ID for consistency
    const encoded = new TextEncoder().encode(explicitId.trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return (
      "g_" +
      hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32)
    );
  }
  // Fallback: hash IP + User-Agent
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  const encoded = new TextEncoder().encode(ip + ua);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return (
    "g_" +
    hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32)
  );
}

interface GenerateRequest {
  profileText: string;
  userProfileText?: string;
  tones: string[];
  mode: "opener" | "followup";
  priorMessage?: string;
  theirReply?: string;
  variationStyle?: "safer" | "warmer" | "funnier" | "shorter";
  userEmail?: string;
}

const conversationTemplates = [
  "Okay, {details} tells me you probably have a good story there.",
  "Your {detail} detail caught my eye. What's the story behind that?",
  "You seem like someone with at least one great {detail} story. What's the best one?",
  "I was going to say something clever, but {detail} distracted me.",
  "{details} is a pretty strong combo. Which one should I ask about first?",
  "I feel like {detail} comes with an underrated story. Am I right?",
];

function extractProfileDetails(profileText: string): string[] {
  const cleaned = profileText
    .replace(/\r/g, "\n")
    .split(/[,;\n.]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part.length <= 80)
    .map((part) => part.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter((part) => part.length > 0);

  const seen = new Set<string>();
  return cleaned.filter((part) => {
    const key = part.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// TEMPLATE_FALLBACK: When extractProfileDetails() finds no usable segment
// (e.g. a single run-on sentence with no delimiters), fall back to a short,
// bounded slice of the raw profile text rather than the entire (up to
// 3000-character) input. 60 characters is roughly one short clause —
// enough to preserve real, user-supplied context inside a single template
// sentence without producing an unnaturally long or broken-looking opener.
const RAW_PROFILE_DETAIL_FALLBACK_MAX = 60;

function boundedRawProfileFallback(profileText: string): string {
  const trimmed = profileText.trim();
  if (!trimmed) return "that detail";
  return trimmed.length > RAW_PROFILE_DETAIL_FALLBACK_MAX
    ? trimmed.slice(0, RAW_PROFILE_DETAIL_FALLBACK_MAX).trim() + "…"
    : trimmed;
}

// TEMPLATE_FALLBACK: Generates exactly `count` opener strings from the
// local template pool only — no external AI calls. Used both for a full
// provider-cascade failure and to backfill individual results that content
// filtering removed. `avoid` (already-surviving AI results, if any) is used
// on a best-effort basis to skip an exact-duplicate template output;
// filtering never leaves fewer than `count` since the pool is shuffled and
// entirely regenerated as candidates before any avoid-filtering happens.
function generateTemplateOpeners(
  profileText: string,
  count: number,
  avoid: string[] = [],
): string[] {
  const details = extractProfileDetails(profileText).slice(0, 5);
  const primaryDetail = details[0] || boundedRawProfileFallback(profileText);
  const joinedDetails =
    details.length > 1
      ? `${details.slice(0, -1).join(", ")} and ${details[details.length - 1]}`
      : primaryDetail;

  // TEMPLATE_VARIETY: shuffle a copy of the pool (Fisher-Yates) so repeated
  // calls — e.g. multiple retries during a provider outage — don't always
  // return the same first N templates. No external calls, no new
  // dependency, and shuffling before slicing guarantees no within-response
  // duplicate template selection.
  const pool = [...conversationTemplates];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const candidates = pool.map((template, index) => {
    const detail = details[index % Math.max(details.length, 1)] || primaryDetail;
    return template
      .replace("{detail}", detail.toLowerCase())
      .replace("{details}", joinedDetails.toLowerCase());
  });

  const deduped = candidates.filter((text) => !avoid.includes(text));
  const source = deduped.length >= count ? deduped : candidates;
  return source.slice(0, Math.min(count, source.length));
}

// AI_PROVIDER: Call Google's Gemini API directly (primary provider).
// Returns the raw text response, or null on any failure (caller decides fallback).
async function callGeminiDirect(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  modelName: string,
  maxAttempts: number,
  timeoutMs: number,
): Promise<string | null> {
  const RETRY_DELAYS_MS = [0, 1000, 2000]; // attempt 1, 2, 3

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (RETRY_DELAYS_MS[attempt] > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAYS_MS[attempt]),
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          }),
        },
      );
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Gemini API error (${modelName}):`,
          response.status,
          errorText,
        );
        if (response.status === 503 && attempt < maxAttempts - 1) {
          continue; // retry only on 503, only if attempts remain
        }
        return null;
      }
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error(`Gemini request timed out after ${timeoutMs / 1000} seconds`);
      } else {
        console.error("Gemini request failed:", error);
      }
      return null;
    }
  }
  return null;
}

// KNOWLEDGE_BASE_PHASE_2A: Concise, static launch generation guide derived
// from knowledge-base/01_core_principles.md and 02_conversation_psychology.md.
// Interpolated once into the opener-mode system prompt only.
const BETTEROPNR_OPENER_GUIDE = `BETTEROPNR LAUNCH GENERATION GUIDE

Generate openers that a normal user could comfortably send with little or no editing.

1. Use the strongest verified profile detail available. Never invent an interest, experience, personality trait, shared history, or compatibility claim.

2. Build each opener around one primary conversational idea and one clear reply path. Avoid multiple unrelated questions or competing topics.

3. Transform profile information instead of merely repeating it. Prefer a specific observation, interpretation, playful premise, or meaningful preference question.

4. Contribute before asking when natural. An observation, reaction, or brief verified user preference should make the message feel reciprocal rather than interview-like.

5. Keep the message appropriate for Stage 1 — Opening. Use moderate warmth, low conversational risk, and no assumed intimacy.

6. Create distinctiveness through profile-specific relevance, not randomness, shock value, forced cleverness, or unrelated jokes.

7. Treat interests as conversation opportunities, not proof of personality or compatibility. Do not convert preferences into unsupported identity claims.

8. Use user self-disclosure only when supported by userProfileText. Keep it brief, low-stakes, relevant, and truthful.

9. Make humor proportional to the profile's demonstrated tone. Match playfulness without trying to outperform it.

10. Prefer natural, concise, sendable language. The opener should be easy to understand, easy to answer, and simple for the user to continue naturally.

11. Avoid generic praise, interview-style questions, premature invitations, body commentary, emotional intensity, manipulation, negging, pressure, and sexualization unsupported by context.

12. When profile evidence is sparse, use restraint. Produce a simple, honest opener rather than fabricating personalization.

13. Never increase specificity beyond the evidence provided. Do not invent cities, locations, days, timing, chronology, frequency, ownership, sales, accomplishments, names, or other factual details that the profile does not explicitly establish.

14. Distinguish what appears in a photo from what belongs to the recipient. Refer to "the dog in your photo," "the market booth," or "the bookshelf" unless ownership is explicitly confirmed.

15. Paraphrase profile language rather than quoting or closely copying it. The opener should demonstrate understanding, not repeat the recipient's own wording back to them.

16. Every opener must create an obvious conversational continuation. It may use a question, a choice, an invitation to correct an assumption, or a clear curiosity gap, but it must not end as a closed observation with no natural reply path.

17. When generating multiple openers, maximize meaningful strategy diversity. Do not return multiple playful assumptions that differ only in subject. Use genuinely different conversational approaches while remaining grounded in the same profile.

18. Playful assumptions must remain visibly tentative and low-stakes. They may invite agreement or correction, but must not introduce unsupported concrete facts. Prefer language such as "I'm guessing," "I have a feeling," or "how wrong am I?" only when the assumption remains harmless and clearly framed as speculation.

19. Before returning each opener, verify that every factual detail can be traced directly to profileText or userProfileText. If a factual detail cannot be traced to the supplied evidence, remove or generalize it.

20. Never invent precise numbers, times, dates, durations, quantities, rankings, percentages, multipliers, distances, measurements, or frequencies unless they are explicitly present in profileText or userProfileText. Tentative phrasing such as "I'm guessing," "I have a feeling," or "probably" does not make fabricated precision acceptable. If an opener becomes vivid only because of an unsupported number, remove or generalize the number. Prefer qualitative wording such as "early," "a while," "a lot," "more than expected," or "often" only when that wording remains a harmless, low-stakes interpretation of verified context.

Playful Assumption does not override the evidence requirement above: a playful premise may interpret verified context, but it may not fabricate a specific city, event, ownership relationship, repeated behavior, or past outcome. Playful Assumptions must not use invented numeric precision as a substitute for genuine specificity.`;

serve(async (req) => {
  const cors = getCorsHeaders(req);
  // OBSERVABILITY: Correlation ID + timing
  const requestId = generateRequestId(req);
  const requestStartMs = Date.now();
  const reqOrigin = req.headers.get("Origin") || null;
  // OBSERVABILITY: Track per-request state for final log
  let reqMode: "auth" | "guest" = "auth";
  let reqUserKey = "unknown";
  let reqStatus = 200;
  let reqErrorCode: string | null = null;
  let reqOpenersReturned = 0;
  let reqGuestRemaining: number | null = null;
  let aiDurationMs: number | null = null;
  let aiProvider: string | null = null;

  // GEN_TIMING: Per-request phase checkpoint tracker. Deliberately kept
  // inside the handler closure (not module scope) so concurrent requests
  // never share or clobber each other's checkpoint state.
  let lastPhaseMs = requestStartMs;
  function logPhase(phase: string, extra?: Record<string, unknown>): void {
    const now = Date.now();
    const elapsedMs = now - requestStartMs;
    const phaseDurationMs = now - lastPhaseMs;
    lastPhaseMs = now;
    console.log(
      "[GEN TIMING]",
      JSON.stringify({ requestId, phase, elapsedMs, phaseDurationMs, ...extra }),
    );
  }
  logPhase("request_received");

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
    headers.set("X-Request-Id", requestId);

    logPhase("final_response_returned", { status });
    logPhase("total_request_duration", {
      totalMs: Date.now() - requestStartMs,
    });

    logEvent({
      type: "request_complete",
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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { ...cors, "X-Request-Id": requestId },
    });
  }

  // GUEST_SECURITY: Reject non-POST methods
  if (req.method !== "POST") {
    reqErrorCode = "METHOD_NOT_ALLOWED";
    return finalizeResponse(
      new Response(
        JSON.stringify({
          error: "METHOD_NOT_ALLOWED",
          message: "Only POST requests are accepted.",
        }),
        {
          status: 405,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      ),
    );
  }

  try {
    // GUEST_SECURITY: Enforce max payload size
    const contentLength = req.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      reqErrorCode = "INVALID_INPUT";
      return finalizeResponse(
        new Response(
          JSON.stringify({
            error: "INVALID_INPUT",
            message: "Request payload is too large.",
          }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          },
        ),
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GUEST_SECURITY: Parse and validate request body
    let requestBody: GenerateRequest;
    try {
      const rawText = await req.text();
      if (rawText.length > MAX_PAYLOAD_BYTES) {
        reqErrorCode = "INVALID_INPUT";
        return finalizeResponse(
          new Response(
            JSON.stringify({
              error: "INVALID_INPUT",
              message: "Request payload is too large.",
            }),
            {
              status: 400,
              headers: { ...cors, "Content-Type": "application/json" },
            },
          ),
        );
      }
      requestBody = JSON.parse(rawText);
      logPhase("request_body_parsed");
    } catch {
      reqErrorCode = "INVALID_INPUT";
      return finalizeResponse(
        new Response(
          JSON.stringify({
            error: "INVALID_INPUT",
            message:
              "Please provide the required information to generate openers.",
          }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          },
        ),
      );
    }

    // Determine if request is authenticated or guest
    const authHeader = req.headers.get("Authorization");
    let userId: string;
    let userPlan = "free";
    let isGuestRequest = false;
    let guestKey = "";

    if (authHeader && authHeader.trim() !== "") {
      // Authenticated path: verify Clerk JWT
      reqMode = "auth";
      metrics.authRequests++;
      const authResult = await verifyClerkJWT(req);

      if (!authResult.success) {
        console.error("Auth failed:", authResult.error);
        reqErrorCode = "AUTH_FAILED";
        return finalizeResponse(
          createAuthErrorResponse(authResult.error, authResult.status, cors),
        );
      }

      userId = authResult.userId;
      reqUserKey = userId;
      console.log("Authenticated user:", userId);
      logPhase("auth_guest_classification_completed", { mode: "auth" });

      // Rate limiting using verified userId
      const now = Date.now();
      const userRateLimit = rateLimitStore.get(userId);

      if (userRateLimit) {
        if (now < userRateLimit.resetTime) {
          if (userRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
            reqErrorCode = "RATE_LIMITED";
            return finalizeResponse(
              new Response(
                JSON.stringify({
                  error: "Rate limit exceeded. Please try again later.",
                }),
                {
                  status: 429,
                  headers: { ...cors, "Content-Type": "application/json" },
                },
              ),
            );
          }
          userRateLimit.count++;
        } else {
          rateLimitStore.set(userId, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
          });
        }
      } else {
        rateLimitStore.set(userId, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW,
        });
      }

      // Get user's plan and check usage limits
      console.log("Fetching user plan for:", userId);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("plan, clerk_user_id")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user:", userError);
        reqErrorCode = "USER_FETCH_FAILED";
        return finalizeResponse(
          new Response(
            JSON.stringify({ error: "Failed to verify user plan" }),
            {
              status: 500,
              headers: { ...cors, "Content-Type": "application/json" },
            },
          ),
        );
      }

      if (!userData) {
        console.warn(
          "User not found in database. Creating a new user record with free plan:",
          userId,
        );
        const emailFromAuth = authResult.email;
        const fallbackEmail = `unknown+${userId}@placeholder.invalid`;
        const emailFromBody =
          requestBody && typeof requestBody.userEmail === "string"
            ? requestBody.userEmail
            : undefined;
        const { data: inserted, error: insertError } = await supabase
          .from("users")
          .insert({
            clerk_user_id: userId,
            email: emailFromAuth || emailFromBody || fallbackEmail,
            username: "User",
            plan: "free",
          })
          .select("plan, clerk_user_id")
          .maybeSingle();

        if (insertError) {
          console.error(
            "Failed to auto-create user. Proceeding with free plan:",
            insertError,
          );
          userPlan = "free";
        } else {
          userPlan = inserted?.plan || "free";
        }
      } else {
        userPlan = userData.plan || "free";
      }
      console.log("User plan:", userPlan);

      // Check usage limits for free users
      if (userPlan === "free") {
        const today = new Date().toISOString().split("T")[0];
        const { data: usageData, error: usageError } = await supabase
          .from("user_usage")
          .select("openers_generated")
          .eq("user_id", userId)
          .eq("date", today)
          .maybeSingle();

        if (usageError) {
          console.error("Error fetching usage:", usageError);
        }

        const openersGenerated = usageData?.openers_generated || 0;
        const FREE_PLAN_LIMIT = 5;

        if (openersGenerated >= FREE_PLAN_LIMIT) {
          reqErrorCode = "DAILY_LIMIT";
          return finalizeResponse(
            new Response(
              JSON.stringify({
                error: "Daily limit reached",
                message:
                  "You have reached your daily limit of 5 openers. Upgrade to Pro for unlimited access.",
                requiresUpgrade: true,
              }),
              {
                status: 403,
                headers: { ...cors, "Content-Type": "application/json" },
              },
            ),
          );
        }
      }
      logPhase("db_reads_completed", { mode: "auth", plan: userPlan });
    } else {
      // GUEST_LIMITS: Guest path — no auth
      isGuestRequest = true;
      reqMode = "guest";
      metrics.guestRequests++;
      const xGuestId = req.headers.get("X-Guest-Id") || "";
      guestKey = await deriveGuestKey(req, xGuestId);
      userId = guestKey;
      reqUserKey = guestKey;
      console.log("Guest request, guestKey:", guestKey);
      logPhase("auth_guest_classification_completed", { mode: "guest" });

      // GUEST_SECURITY: Short-term throttle — max 1 request per 10s per guest
      const lastReqAt = guestThrottleStore.get(guestKey) || 0;
      const nowMs = Date.now();
      if (nowMs - lastReqAt < GUEST_THROTTLE_MS) {
        reqErrorCode = "GUEST_TOO_FAST";
        return finalizeResponse(
          new Response(
            JSON.stringify({
              error: "GUEST_TOO_FAST",
              message: "Please wait a moment before generating again.",
            }),
            {
              status: 429,
              headers: { ...cors, "Content-Type": "application/json" },
            },
          ),
        );
      }
      guestThrottleStore.set(guestKey, nowMs);

      // In-memory rate limiting for guests
      const now = Date.now();
      const guestRateLimit = rateLimitStore.get(guestKey);
      if (guestRateLimit) {
        if (now < guestRateLimit.resetTime) {
          if (guestRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
            reqErrorCode = "RATE_LIMITED";
            return finalizeResponse(
              new Response(
                JSON.stringify({
                  error: "Rate limit exceeded. Please try again later.",
                }),
                {
                  status: 429,
                  headers: { ...cors, "Content-Type": "application/json" },
                },
              ),
            );
          }
          guestRateLimit.count++;
        } else {
          rateLimitStore.set(guestKey, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
          });
        }
      } else {
        rateLimitStore.set(guestKey, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW,
        });
      }

      // GUEST_LIMITS: Server-side daily usage check
      const todayUtc = new Date().toISOString().split("T")[0];
      const { data: guestUsage, error: guestUsageError } = await supabase
        .from("guest_generation_usage")
        .select("runs_used, date_utc")
        .eq("guest_key", guestKey)
        .eq("date_utc", todayUtc)
        .maybeSingle();

      if (guestUsageError) {
        console.error("Error fetching guest usage:", guestUsageError);
      }

      const runsUsed =
        guestUsage && guestUsage.date_utc === todayUtc
          ? guestUsage.runs_used
          : 0;
      logPhase("db_reads_completed", { mode: "guest" });

      if (runsUsed >= GUEST_DAILY_RUN_LIMIT) {
        console.log("Guest limit reached for:", guestKey, "runs:", runsUsed);
        reqErrorCode = "GUEST_LIMIT_REACHED";
        reqGuestRemaining = 0;
        return finalizeResponse(
          new Response(
            JSON.stringify({
              error: "GUEST_LIMIT_REACHED",
              message:
                "Guest limit reached. Create a free account to continue.",
              guestLimits: buildGuestLimits(runsUsed),
            }),
            {
              status: 429,
              headers: { ...cors, "Content-Type": "application/json" },
            },
          ),
        );
      }
    }

    const {
      profileText,
      userProfileText,
      tones,
      mode,
      priorMessage,
      theirReply,
      variationStyle,
    } = requestBody;

    console.log("Generate request:", {
      userId,
      userPlan,
      mode,
      isGuestRequest,
    });

    // Enhanced input validation
    if (!profileText?.trim()) {
      reqErrorCode = "MISSING_PROFILE";
      return finalizeResponse(
        new Response(JSON.stringify({ error: "Profile text is required" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        }),
      );
    }

    // Enforce input length limits (increased to 3000 characters)
    if (
      profileText.length > 3000 ||
      (userProfileText && userProfileText.length > 3000)
    ) {
      reqErrorCode = "INPUT_TOO_LONG";
      return finalizeResponse(
        new Response(
          JSON.stringify({
            error: "Profile text is too long. Maximum 3000 characters allowed.",
          }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          },
        ),
      );
    }

    // Validate tones array
    const allowedTones = [
      "playful",
      "sincere",
      "thoughtful",
      "fun",
      "flirty",
      "bold",
      "curious",
      "confident",
      "funny",
    ];
    if (!tones || tones.length === 0) {
      reqErrorCode = "MISSING_TONES";
      return finalizeResponse(
        new Response(
          JSON.stringify({ error: "At least one tone must be selected" }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          },
        ),
      );
    }
    if (
      tones.length > 4 ||
      !tones.every((tone) => allowedTones.includes(tone))
    ) {
      reqErrorCode = "INVALID_TONES";
      return finalizeResponse(
        new Response(
          JSON.stringify({
            error: "Invalid tones provided. Maximum 4 allowed tones.",
          }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          },
        ),
      );
    }

    // Content filtering
    if (containsBlockedContent(profileText)) {
      reqErrorCode = "BLOCKED_CONTENT";
      return finalizeResponse(
        new Response(
          JSON.stringify({
            error: "Content contains inappropriate language. Please revise.",
          }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          },
        ),
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      console.error("No AI provider configured (GEMINI_API_KEY or LOVABLE_API_KEY)");
      logPhase("retry_or_fallback_started", { reason: "no_ai_provider_configured" });
      const fallbackResult = fallbackGeneration(
        profileText,
        userProfileText,
        tones,
        mode,
        priorMessage,
        theirReply,
        variationStyle,
        isGuestRequest,
        cors,
      );
      logPhase("retry_or_fallback_completed", { reason: "no_ai_provider_configured" });
      // GUEST_LIMITS_SYNC: Increment usage on successful fallback for guests and attach guestLimits
      if (isGuestRequest) {
        const newUsed = await incrementGuestUsage(supabase, guestKey);
        logPhase("db_usage_updates_completed", { mode: "guest" });
        const injected = await injectGuestLimits(fallbackResult, newUsed);
        if (newUsed >= 0)
          reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
        return finalizeResponse(injected);
      }
      return finalizeResponse(fallbackResult);
    }

    // Build variation-specific instructions
    let variationInstruction = "";
    if (variationStyle === "safer") {
      variationInstruction =
        " Make it more appropriate, polite, and professional.";
    } else if (variationStyle === "warmer") {
      variationInstruction =
        " Make it more friendly, kind, and emotionally warm.";
    } else if (variationStyle === "funnier") {
      variationInstruction = " Make it more humorous, witty, and playful.";
    } else if (variationStyle === "shorter") {
      variationInstruction =
        " Make it significantly shorter and more concise (under 120 characters).";
    }

    const profileDetails = extractProfileDetails(profileText);
    const profileDetailList = profileDetails.length
      ? profileDetails.map((detail, index) => `${index + 1}. ${detail}`).join("\n")
      : profileText.trim();

    // Build context with both profiles
    const profileContext = userProfileText?.trim()
      ? `Their full profile text:\n${profileText}\n\nTheir extracted profile details:\n${profileDetailList}\n\nYour interests:\n${userProfileText}`
      : `Their full profile text:\n${profileText}\n\nTheir extracted profile details:\n${profileDetailList}`;

    const commonInterestHint = userProfileText?.trim()
      ? " When possible, find common ground between their interests and yours to create natural connections."
      : "";

    // Build the system prompt
    const systemPrompt =
      mode === "opener"
        ? `You are a real person writing a natural dating app message, not a bot. Your goal: write short messages that sound like a normal person texting on a dating app after actually reading the profile.

CRITICAL RULES:
- Every opener must clearly reference a specific detail from "Their full profile text" or "Their extracted profile details." Never write an opener that could be sent to anyone regardless of profile.
- Use the full profile context, not just the first detail. Across the set, cover different details or different angles on the provided details.
- If the profile mentions a dog, hunting, outdoors, a hiking photo, travel spot, prompt answer, job, hobby, or food, use that actual detail.
- Do not invent random topics. Never mention food, pets, travel, hiking, coffee, pizza, tacos, or any other topic unless the profile implies it — do not reach for generic dating-app fallback topics (pizza vs. tacos, dogs vs. cats, coffee vs. tea, "if you could..." hypotheticals) just to fill space.
- Prefer a specific, concrete detail over a generic compliment. Do not write "you seem cool," "great smile," "you seem fun," or similar compliments that don't reference anything specific.
- Leave a small curiosity gap — the message should make them want to reply to find out more, not feel fully answered or like a survey question.
- Never write interview-style questions: no "what do you do for fun," "tell me about yourself," stacked/multi-part questions, either-or questions, vague superlative questions, hot-take prompts, three-word challenges, or generic origin-story prompts.
- Never claim shared enthusiasm unless the user's own profile explicitly supports it.
- If the input is vague, ask a natural opener about the exact provided topic instead of inventing a new one.
- Each opener must use one of these three distinct strategies:
  1. Specific Observation — name a concrete detail and react to it.
  2. Playful Assumption — make a low-stakes, teasable guess based on a concrete detail.
  3. Curiosity-Gap Prompt — invite a story or answer about a concrete detail without asking a flat, interview-style question.
${isGuestRequest
  ? "  Use two different strategies across the set — you do not need to cover all three."
  : "  The full set should cover all three strategies."}
- Sound casual, short, and date-app natural. Use contractions and light personality.
- Avoid polished, formal, salesy, quirky-for-quirky's-sake, or overly clever wording.
- Never directly quote or copy phrases from their profile; paraphrase naturally.
- Match the tone (${tones.join(
            "/",
          )}) but keep it feeling authentic and unforced${variationInstruction}${commonInterestHint}
- Length: Under ${MAX_OPENER_LENGTH} characters
- No pickup lines, generic openers, or anything inappropriate

${BETTEROPNR_OPENER_GUIDE}

Examples for input "hunting, outdoors, dogs":
"Okay, hunting and dogs tells me you're probably impossible to beat on a camping trip."
"Your dog looks like they'd judge my outdoor skills immediately. What's their name?"
"You seem like someone who has at least one wild outdoors story — what's the best one?"

Only use details like hunting, outdoors, or dogs when the profile includes them.`
        : theirReply
        ? `You're a real person continuing a natural dating app conversation, not a bot. Write follow-up messages that feel like genuine, flowing conversation.

CRITICAL RULES:
- Acknowledge their reply in a natural, conversational way (not formal)
- Don't echo their exact words back - paraphrase or react naturally
- Add your own perspective or quick reaction that feels personal and real
- Ask a specific follow-up question that keeps the conversation going
- If appropriate, casually suggest a low-key meetup (coffee, walk, etc.)
- Match tone (${tones.join(
            "/",
          )}) but sound like a real person texting${variationInstruction}${commonInterestHint}
- Keep under 200 characters
- Avoid sounding scripted or too polished - embrace casual imperfection

Think: How would you naturally respond if you were excited about their reply?`
        : `You're a real person gently re-engaging after a dating app conversation stalled, not a bot. Write messages that are light, non-needy, and feel genuinely casual.

CRITICAL RULES:
- Reference the previous conversation naturally without being weird about the gap
- Be playful and low-pressure - never guilt-trip or seem desperate
- Sound like you just remembered something fun about your chat
- Keep it short, breezy, and easy to respond to
- Match tone (${tones.join("/")})${variationInstruction}
- Keep under 150 characters
- No "just checking in" or "hope you're well" - too formal

Think: What would you actually send if you wanted to casually revive a fun chat?`;

    // GUEST_LIMITS: Guest gets exactly 2 openers, authenticated gets 4
    const openerCount = isGuestRequest ? GUEST_OPENERS_PER_RUN : 4;

    const userPrompt =
      mode === "opener"
        ? `${profileContext}\n\nWrite ${openerCount} unique, natural conversation openers. Sound like a real person who noticed something interesting and wants to chat about it. Be ${tones.join(
            ", ",
          )} - but authentic, not trying too hard.${variationInstruction}${commonInterestHint}\n\nEvery opener must clearly reference specific user-provided profile/bio/screenshot text. Use the full profile, not just the first detail. Prefer a specific, concrete detail over a generic compliment, and leave a small curiosity gap so they want to reply. Do not invent random topics unless their profile mentions or implies them, and never reach for generic dating-app fallback topics (pizza vs. tacos, dogs vs. cats, coffee vs. tea, "if you could..." hypotheticals) just to fill space.\n\nAcross the set, each opener must use one of these three distinct strategies: (1) Specific Observation - name a concrete detail and react to it, (2) Playful Assumption - a low-stakes, teasable guess based on a concrete detail, (3) Curiosity-Gap Prompt - invite a story or answer about a concrete detail without asking a flat, interview-style question. ${isGuestRequest ? "Use two different strategies from the three above — you do not need to cover all three." : "The full set should cover all three strategies above."} Never write interview-style questions like "what do you do for fun" or "tell me about yourself," and avoid either-or questions, vague superlative questions, hot-take prompts, three-word challenges, and generic origin-story prompts. Never claim shared enthusiasm unless the user's own profile explicitly supports it.\n\nKeep each opener casual, short, human, and dating-app style. Don't copy exact words from their profile. Paraphrase naturally. Write like you're genuinely texting someone.\n\nReturn ONLY a JSON array of ${openerCount} strings, no other text.`
        : theirReply
        ? `${profileContext}\n\nMy message: "${priorMessage}"\nTheir reply: "${theirReply}"\n\nWrite 3-5 natural follow-up messages. React to what they said like a real person would, add your take, and keep the conversation flowing. Be ${tones.join(
            ", ",
          )}.${variationInstruction}${commonInterestHint}\n\nReturn ONLY a JSON array of strings, no other text.`
        : `${profileContext}\n\nMy last message: "${priorMessage}"\n\nThey went quiet 24-48h ago. Write 3-5 light, casual messages to re-engage without being pushy. Be ${tones.join(
            ", ",
          )}.${variationInstruction}\n\nReturn ONLY a JSON array of strings, no other text.`;

    // GEN_TIMING: lengths only — never log profileText/userPrompt/systemPrompt
    // content, which would leak profile text and generated openers.
    logPhase("prompt_construction_completed", {
      profileTextLength: profileText.length,
      profileDetailListLength: profileDetailList.length,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      openerCount,
    });

    // OBSERVABILITY: Track AI call timing
    let content: string | null = null;
    const aiStartMs = Date.now();
    logPhase("ai_request_started");

    // AI_PROVIDER: Attempt 1 — Gemini direct, gemini-3.5-flash (primary
    // model, 2 attempts: initial + one retry, retry on 503 only)
    if (GEMINI_API_KEY) {
      console.log("Calling Gemini API directly (gemini-3.5-flash)...");
      content = await callGeminiDirect(
        systemPrompt,
        userPrompt,
        GEMINI_API_KEY,
        "gemini-3.5-flash",
        2,
        10000,
      );
      aiDurationMs = Date.now() - aiStartMs;
      if (content) {
        aiProvider = "gemini-3.5-flash-direct";
      }
      logPhase("ai_attempt_completed", {
        provider: "gemini-3.5-flash",
        attempt: 1,
        success: Boolean(content),
        attemptDurationMs: aiDurationMs,
      });
    }

    // AI_PROVIDER: Attempt 1b — Gemini direct, gemini-3.1-flash-lite
    // (secondary model, single attempt, only if gemini-3.5-flash failed)
    if (!content && GEMINI_API_KEY) {
      logPhase("retry_or_fallback_started", { reason: "gemini_flash_failed_trying_lite" });
      console.log("Calling Gemini API directly (gemini-3.1-flash-lite)...");
      const geminiLiteStartMs = Date.now();
      content = await callGeminiDirect(
        systemPrompt,
        userPrompt,
        GEMINI_API_KEY,
        "gemini-3.1-flash-lite",
        1,
        25000,
      );
      aiDurationMs = Date.now() - geminiLiteStartMs;
      if (content) {
        aiProvider = "gemini-3.1-flash-lite-direct";
      }
      logPhase("retry_or_fallback_completed", {
        reason: "gemini_flash_failed_trying_lite",
        provider: "gemini-3.1-flash-lite",
        success: Boolean(content),
        attemptDurationMs: aiDurationMs,
      });
    }

    // AI_PROVIDER: Attempt 2 — Lovable AI Gateway (fallback, only if both
    // Gemini models are unavailable or failed, and LOVABLE_API_KEY exists)
    if (!content && LOVABLE_API_KEY) {
      logPhase("retry_or_fallback_started", { reason: "gemini_failed_trying_lovable_gateway" });
      const lovableStartMs = Date.now();
      console.log("Calling Lovable AI API...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error("AI request timed out after 25 seconds");
        controller.abort();
      }, 25000);

      let response: Response | undefined;
      try {
        response = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
          },
        );
        clearTimeout(timeoutId);
        console.log("AI API response status:", response.status);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          console.error("AI request was aborted due to timeout");
        } else {
          console.error("AI request failed:", error);
        }
      }
      aiDurationMs = Date.now() - lovableStartMs;

      if (response) {
        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI gateway error:", response.status, errorText);

          // RESILIENCE: Lovable is the last external provider tier — 429
          // (rate limited) and 402 (credits exhausted) no longer hard-fail
          // the client here. content stays null and execution falls
          // through to the local template fallback below, which is now
          // the guaranteed final resilience tier for any external-provider
          // exhaustion, not just an empty/unparseable AI response.
        } else {
          const data = await response.json();
          content = data.choices?.[0]?.message?.content ?? null;
          if (content) {
            aiProvider = "google/gemini-2.5-flash (lovable-gateway)";
          }
        }
      }
      logPhase("retry_or_fallback_completed", {
        reason: "gemini_failed_trying_lovable_gateway",
        provider: "google/gemini-2.5-flash (lovable-gateway)",
        success: Boolean(content),
        attemptDurationMs: aiDurationMs,
      });
    }

    logPhase("ai_response_received", {
      finalProvider: aiProvider,
      hadContent: Boolean(content),
    });

    // AI_PROVIDER: Attempt 3 — emergency template fallback (neither provider
    // produced usable content)
    if (!content) {
      console.error("No AI content available from any provider");
      logPhase("retry_or_fallback_started", { reason: "no_ai_content_from_any_provider" });
      const fallbackResult = fallbackGeneration(
        profileText,
        userProfileText,
        tones,
        mode,
        priorMessage,
        theirReply,
        variationStyle,
        isGuestRequest,
        cors,
      );
      logPhase("retry_or_fallback_completed", { reason: "no_ai_content_from_any_provider" });
      if (isGuestRequest) {
        const newUsed = await incrementGuestUsage(supabase, guestKey);
        logPhase("db_usage_updates_completed", { mode: "guest" });
        const injected = await injectGuestLimits(fallbackResult, newUsed);
        if (newUsed >= 0)
          reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
        return finalizeResponse(injected);
      }
      return finalizeResponse(fallbackResult);
    }

    // Parse the JSON array from the response
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      let results = JSON.parse(cleanContent);
      logPhase("response_parsed", {
        parsedCount: Array.isArray(results) ? results.length : 0,
      });

      if (Array.isArray(results) && results.length > 0) {
        const preFilterCount = results.length;
        // Enforce max length and filter inappropriate/cliche content
        let filteredResults = results
          .map((text: string) => enforceMaxLength(text))
          .filter((text: string) => !containsBlockedContent(text))
          .filter(
            (text: string) => mode !== "opener" || !containsBannedPhrase(text),
          );

        // GUEST_LIMITS: Enforce output size for guests
        if (isGuestRequest) {
          filteredResults = filteredResults.slice(0, GUEST_OPENERS_PER_RUN);
        }

        // BACKFILL: content filtering can remove some (but not all) opener
        // results. Rather than silently returning fewer than requested,
        // fill the gap from the local template pool only — no external
        // Gemini or Lovable call, and no separate usage increment (the
        // single increment below still fires exactly once for this
        // request). If zero results survived filtering, this is skipped
        // and the existing full-fallback path below handles it instead.
        if (
          mode === "opener" &&
          filteredResults.length > 0 &&
          filteredResults.length < openerCount
        ) {
          const backfill = generateTemplateOpeners(
            profileText,
            openerCount - filteredResults.length,
            filteredResults,
          );
          logPhase("results_backfilled_from_templates", {
            backfilledCount: backfill.length,
            finalCount: filteredResults.length + backfill.length,
          });
          filteredResults = filteredResults.concat(backfill);
        }

        // GEN_TIMING: preFilterCount vs postFilterCount shows whether content
        // filtering ever reduces a guest's requested opener count (counts
        // only — never logs opener text).
        logPhase("results_validated_filtered", {
          preFilterCount,
          postFilterCount: filteredResults.length,
          requestedCount: openerCount,
        });

        if (filteredResults.length > 0) {
          console.log(
            "Successfully generated",
            filteredResults.length,
            "results",
          );
          reqOpenersReturned = filteredResults.length;

          // GUEST_LIMITS_SYNC: Increment usage and include guestLimits in response
          const responsePayload: {
            results: string[];
            guestLimits?: ReturnType<typeof buildGuestLimits>;
          } = { results: filteredResults };
          if (isGuestRequest) {
            const newUsed = await incrementGuestUsage(supabase, guestKey);
            logPhase("db_usage_updates_completed", { mode: "guest" });
            if (newUsed >= 0) {
              responsePayload.guestLimits = buildGuestLimits(newUsed);
              reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
            }
          } else {
            logPhase("db_usage_updates_completed", {
              mode: "auth",
              applicable: false,
            });
          }

          return finalizeResponse(
            new Response(JSON.stringify(responsePayload), {
              headers: { ...cors, "Content-Type": "application/json" },
            }),
          );
        }
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      logPhase("response_parsed", { parsedCount: 0, parseError: true });
    }

    // Fall back to local templates: reached either when the AI response
    // failed to parse, or when parsing succeeded but every result was
    // removed by content filtering (with none surviving to backfill above).
    logPhase("retry_or_fallback_started", { reason: "parse_failed_or_empty_results" });
    const fallbackResult = fallbackGeneration(
      profileText,
      userProfileText,
      tones,
      mode,
      priorMessage,
      theirReply,
      variationStyle,
      isGuestRequest,
      cors,
    );
    logPhase("retry_or_fallback_completed", { reason: "parse_failed_or_empty_results" });
    if (isGuestRequest) {
      const newUsed = await incrementGuestUsage(supabase, guestKey);
      logPhase("db_usage_updates_completed", { mode: "guest" });
      const injected = await injectGuestLimits(fallbackResult, newUsed);
      if (newUsed >= 0)
        reqGuestRemaining = Math.max(0, GUEST_DAILY_RUN_LIMIT - newUsed);
      return finalizeResponse(injected);
    }
    return finalizeResponse(fallbackResult);
  } catch (error) {
    // GUEST_SECURITY: Never leak technical errors
    console.error("Error in generate function:", error);
    reqErrorCode = "SERVER_ERROR";
    return finalizeResponse(
      new Response(
        JSON.stringify({
          error: "SERVER_ERROR",
          message: "Something went wrong. Please try again.",
        }),
        {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      ),
    );
  }
});

// GUEST_LIMITS_SYNC: Increment guest daily run counter and return new runs_used
async function incrementGuestUsage(
  supabase: any,
  guestKey: string,
): Promise<number> {
  const todayUtc = new Date().toISOString().split("T")[0];
  try {
    const { data: existing } = await supabase
      .from("guest_generation_usage")
      .select("runs_used")
      .eq("guest_key", guestKey)
      .eq("date_utc", todayUtc)
      .maybeSingle();

    const newUsed = existing ? existing.runs_used + 1 : 1;

    if (existing) {
      await supabase
        .from("guest_generation_usage")
        .update({ runs_used: newUsed, updated_at: new Date().toISOString() })
        .eq("guest_key", guestKey)
        .eq("date_utc", todayUtc);
    } else {
      await supabase
        .from("guest_generation_usage")
        .insert({ guest_key: guestKey, date_utc: todayUtc, runs_used: 1 });
    }
    console.log(
      "Guest usage incremented for:",
      guestKey,
      "date:",
      todayUtc,
      "newUsed:",
      newUsed,
    );
    return newUsed;
  } catch (e) {
    console.error("Failed to increment guest usage:", e);
    return -1; // unknown
  }
}

// GUEST_LIMITS_SYNC: Build guestLimits payload
function buildGuestLimits(runsUsed: number): {
  remainingRunsToday: number;
  resetDateUtc: string;
} {
  const resetDateUtc = new Date().toISOString().split("T")[0];
  return {
    remainingRunsToday: Math.max(0, GUEST_DAILY_RUN_LIMIT - runsUsed),
    resetDateUtc,
  };
}

// GUEST_LIMITS_SYNC: Inject guestLimits into an existing Response (for fallback paths)
async function injectGuestLimits(
  resp: Response,
  newUsed: number,
): Promise<Response> {
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
  mode: "opener" | "followup",
  priorMessage: string | undefined,
  theirReply: string | undefined,
  variationStyle: string | undefined,
  isGuest: boolean | undefined,
  cors: Record<string, string>,
): Response {
  console.log("Using fallback template generation");

  if (mode === "followup") {
    if (!theirReply) {
      const reEngagementTemplates = [
        "Hey! Just remembered our chat about that. How'd it go?",
        "Random thought: still thinking about what you said. Any updates?",
        "Okay but I need to know the verdict on that thing we discussed 👀",
        "Plot twist: I'm back. What's new with you?",
      ];
      return new Response(JSON.stringify({ results: reEngagementTemplates }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const followUpTemplates = [
      "Ha! That's actually really interesting. What made you think of that?",
      "Wait, tell me more about that part!",
      "Okay now I'm curious - what's the story behind that?",
      "Love that take. So what's next on your radar?",
      "That tracks honestly. Wanna grab coffee and discuss?",
    ];
    return new Response(JSON.stringify({ results: followUpTemplates }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // GUEST_LIMITS: Limit fallback results for guests
  const count = isGuest ? GUEST_OPENERS_PER_RUN : 4;
  const results = generateTemplateOpeners(profileText, count);

  return new Response(JSON.stringify({ results }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
