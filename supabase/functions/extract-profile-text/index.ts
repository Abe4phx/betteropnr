import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI_PROVIDER: Direct Gemini API call for this function, replacing the
// previous Lovable AI Gateway integration.
const GEMINI_MODEL = 'gemini-3.5-flash';
// RESILIENCE: Final-attempt fallback used only after two consecutive 503s
// from the primary model.
const GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_RETRY_DELAY_MS = 750;
// Per-attempt request timeout. Generous for an image-extraction call under
// normal latency, while still bounding a hung request instead of letting it
// run until the platform's own execution limit.
const GEMINI_REQUEST_TIMEOUT_MS = 20000;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Reject payloads above this before ever calling Gemini. 8 MB comfortably
// covers a phone screenshot while bounding worst-case memory/cost. Checked
// against the base64 string length directly (no decoding needed) using the
// standard base64 expansion ratio (4 chars per 3 raw bytes).
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_BASE64_LENGTH = Math.ceil((MAX_IMAGE_BYTES * 4) / 3);

const EXTRACTION_INSTRUCTION =
  'Extract all visible text from this dating profile screenshot. Return only the extracted text, organized clearly with line breaks between sections. Preserve names, prompts, captions, labels, and profile details. Do not add commentary, explanations, summaries, or markdown.';

interface ParsedImage {
  mimeType: string;
  base64Data: string;
}

// Parses a `data:<mime-type>;base64,<data>` URL. Returns null for anything
// malformed or for a MIME type we don't accept.
function parseImageDataUrl(image: unknown): ParsedImage | null {
  if (typeof image !== 'string') return null;

  const match = /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(image);
  if (!match) return null;

  const [, mimeType, base64Data] = match;
  if (!ALLOWED_MIME_TYPES.has(mimeType)) return null;
  if (!base64Data) return null;

  return { mimeType, base64Data };
}

// RESILIENCE: Small local helper so the same request shape can be issued
// against different model names (primary retry, then fallback model).
// Each call gets its own AbortController/timer, so every attempt (including
// the retry and the fallback model) is independently bounded by
// GEMINI_REQUEST_TIMEOUT_MS. An aborted request rejects like any other
// fetch failure, which the caller's existing catch block already turns into
// the generic extraction-failure response.
function callGeminiGenerateContent(
  modelName: string,
  apiKey: string,
  mimeType: string,
  base64Data: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: EXTRACTION_INSTRUCTION },
            ],
          },
        ],
      }),
      signal: controller.signal,
    },
  ).finally(() => clearTimeout(timeoutId));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

  try {
    // Verify JWT - this function requires authentication
    const authResult = await verifyClerkJWT(req);

    if (!authResult.success) {
      console.error('Auth failed:', authResult.error);
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    console.log('Authenticated user for text extraction:', authResult.userId);

    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsedImage = parseImageDataUrl(image);
    if (!parsedImage) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const { mimeType, base64Data } = parsedImage;

    if (base64Data.length > MAX_IMAGE_BASE64_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Image is too large. Please use a smaller screenshot.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting text from profile screenshot...', {
      userId: authResult.userId,
      mimeType,
      base64Length: base64Data.length,
    });

    let response: Response;
    try {
      // Attempt 1: primary model.
      response = await callGeminiGenerateContent(GEMINI_MODEL, GEMINI_API_KEY, mimeType, base64Data);
      console.log('Gemini extraction attempt', { model: GEMINI_MODEL, attempt: 1, status: response.status });

      if (response.status === 503) {
        // Attempt 2: primary model, single retry after a fixed delay —
        // only for a transient 503, never for any other status.
        await new Promise((resolve) => setTimeout(resolve, GEMINI_RETRY_DELAY_MS));
        response = await callGeminiGenerateContent(GEMINI_MODEL, GEMINI_API_KEY, mimeType, base64Data);
        console.log('Gemini extraction attempt', { model: GEMINI_MODEL, attempt: 2, status: response.status });

        if (response.status === 503) {
          // Attempt 3: final attempt, fallback model — only reached after
          // two consecutive 503s from the primary model.
          response = await callGeminiGenerateContent(GEMINI_FALLBACK_MODEL, GEMINI_API_KEY, mimeType, base64Data);
          console.log('Gemini extraction attempt', { model: GEMINI_FALLBACK_MODEL, attempt: 3, status: response.status });
        }
      }
    } catch (fetchError) {
      console.error(
        'Gemini request failed:',
        fetchError instanceof Error ? fetchError.message : 'unknown error',
      );
      return new Response(
        JSON.stringify({ error: 'Failed to extract text from image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Gemini response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 401 || response.status === 403) {
        console.error('Gemini authentication/configuration error, status:', response.status);
        return new Response(
          JSON.stringify({ error: 'AI service not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Gemini API error, status:', response.status);
      return new Response(
        JSON.stringify({ error: 'Failed to extract text from image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;

    const extractedText = Array.isArray(parts)
      ? parts
          .map((part: { text?: string }) =>
            typeof part?.text === 'string' ? part.text.trim() : '',
          )
          .filter((text: string) => text.length > 0)
          .join('\n')
      : '';

    if (!extractedText) {
      console.error('No usable text extracted from Gemini response');
      return new Response(
        JSON.stringify({ error: 'No text could be extracted from this image' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully extracted text from profile screenshot', {
      durationMs: Date.now() - startMs,
    });

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-profile-text function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
