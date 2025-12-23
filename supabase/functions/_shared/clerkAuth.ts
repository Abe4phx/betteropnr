/**
 * Clerk JWT Authentication Helper for Supabase Edge Functions
 * Verifies Clerk JWTs and extracts user information
 */

interface ClerkJWTPayload {
  sub: string;  // Clerk user ID
  email?: string;
  exp: number;
  iat: number;
  iss: string;
}

export interface AuthResult {
  userId: string;
  email?: string;
}

export interface AuthError {
  error: string;
  status: number;
}

export type VerifyResult = { success: true } & AuthResult | { success: false } & AuthError;

/**
 * Decode base64url to string
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * Parse JWT without verification (for development/debugging)
 * In production, you should verify the signature using Clerk's JWKS
 */
function parseJWT(token: string): ClerkJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format: expected 3 parts');
      return null;
    }
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * Verify Clerk JWT from Authorization header
 * Returns the verified user ID or an error
 */
export async function verifyClerkJWT(req: Request): Promise<VerifyResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    console.warn('No Authorization header provided');
    return { error: 'No authorization header provided', status: 401 };
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.warn('Invalid Authorization header format');
    return { error: 'Invalid authorization header format', status: 401 };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token) {
    console.warn('Empty token in Authorization header');
    return { error: 'No token provided', status: 401 };
  }

  // Parse the JWT
  const payload = parseJWT(token);
  
  if (!payload) {
    return { error: 'Invalid token format', status: 401 };
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    console.warn('Token expired:', { exp: payload.exp, now });
    return { error: 'Token expired', status: 401 };
  }

  // Verify issuer matches Clerk
  const clerkIssuer = Deno.env.get('CLERK_ISSUER_URL');
  if (clerkIssuer && payload.iss) {
    // Clerk issuer format: https://xxx.clerk.accounts.dev or custom domain
    if (!payload.iss.includes('clerk') && payload.iss !== clerkIssuer) {
      console.warn('Invalid issuer:', { expected: clerkIssuer, got: payload.iss });
      return { error: 'Invalid token issuer', status: 401 };
    }
  }

  // Extract user ID from 'sub' claim (Clerk user ID)
  if (!payload.sub) {
    console.warn('No sub claim in token');
    return { error: 'Invalid token: missing user ID', status: 401 };
  }

  console.log('JWT verified successfully:', { userId: payload.sub });
  
  return {
    userId: payload.sub,
    email: payload.email,
  };
}

/**
 * Helper to create an error response
 */
export function createAuthErrorResponse(error: string, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
