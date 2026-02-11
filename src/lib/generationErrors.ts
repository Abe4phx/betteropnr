// GUEST_HARDENING: Standardize error messages for generation failures

export interface ParsedGenerationError {
  status: number | null;
  code: string | null;
  message: string;
}

/**
 * Extract structured info from a Supabase edge-function error object.
 */
export function parseEdgeFunctionError(error: unknown): ParsedGenerationError {
  const e = error as Record<string, any> | null;
  const status = e?.context?.status ?? e?.status ?? null;
  const code =
    e?.context?.error ?? e?.context?.response?.error ?? null;
  const rawMsg =
    e?.context?.error ?? e?.context?.response?.error ?? e?.message ?? '';
  return { status, code, message: String(rawMsg) };
}

/**
 * Return a user-friendly toast message for a generation error.
 * `isGuest` controls tone (guest → nudge sign-up, authed → neutral).
 */
export function friendlyGenerationMessage(
  parsed: ParsedGenerationError,
  isGuest: boolean
): string {
  const { status, message } = parsed;

  if (status === 401 || status === 403) {
    if (isGuest) return 'Please sign up or log in to continue.';
    if (message && message.toLowerCase().includes('daily limit'))
      return 'Daily limit reached. Upgrade for unlimited openers!';
    return 'Authentication error. Please sign in again.';
  }

  if (status === 402)
    return 'AI credits exhausted. Please add credits to continue.';

  // 429 for non-GUEST_LIMIT cases (rate-limit)
  if (status === 429)
    return 'Rate limit exceeded. Please try again in a moment.';

  if (message && message.toLowerCase().includes('timeout'))
    return 'Request timed out. Please try again.';

  // Catch-all for 5xx / network / unknown
  return 'Something went wrong generating openers. Please try again.';
}
