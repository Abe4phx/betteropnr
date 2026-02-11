

## Fix Guest Generation: Allow Unauthenticated Requests in Edge Function

### Problem
The `generate` edge function rejects all requests without a valid Clerk JWT (line 79-84), returning 401 to guest users.

### Changes

**1. Edge Function (`supabase/functions/generate/index.ts`)** -- Add guest path

At the top of the request handler (after CORS check, line 77), add a branch:

- Check if `Authorization` header is present and non-empty
- **If NO header (guest)**:
  - Set `userId = 'guest'`
  - Skip Clerk JWT verification, user plan lookup, and usage limit checks
  - Proceed to input validation, content filtering, rate limiting, and generation
  - In the AI prompt for guests, request only 2 openers instead of 4
- **If header present (authenticated)**: keep existing flow exactly as-is

The guest path will still enforce:
- Input validation (profile text required, length limits, tone validation)
- Content filtering (blocked words)
- Rate limiting (using `'guest'` key -- shared, but acceptable for MVP)
- Max opener length

**2. Frontend (`src/pages/Generator.tsx`)** -- Three targeted fixes

- **Move `consumeGuestRun()` from line 104 (before API call) to after successful response (after line 186)**. Only consume a run when the edge function succeeds.
- **Add guest-friendly error handling**: In the error block (line 152-176), if `guestMode`, show: "Guest generation is temporarily unavailable. Please create a free account to continue." with a Sign Up CTA instead of the generic error.
- **Add diagnostic logs** before the `supabase.functions.invoke` call for debugging:
  - `[GEN_OPENERS] endpoint: generate`
  - `[GEN_OPENERS] isAuthenticated: true/false`
  - `[GEN_OPENERS] hasAuthHeader: true/false`

### What stays unchanged
- All logged-in user behavior (Clerk auth, plan checks, usage limits)
- Variation and follow-up generation (require auth)
- Guest daily limit logic in `src/utils/guestLimits.ts`
- Guest detection, routes, UI badges
- Opener slicing for guests (already at line 186)
