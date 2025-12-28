/**
 * Clerk JWT Authentication Helper for Supabase Edge Functions
 * Verifies Clerk JWTs using JWKS-based cryptographic signature verification
 */

import { createRemoteJWKSet, jwtVerify, JWTPayload } from "https://deno.land/x/jose@v5.2.2/index.ts";

interface ClerkJWTPayload extends JWTPayload {
  sub: string;  // Clerk user ID
  email?: string;
  azp?: string; // Authorized party (client ID)
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

// Cache the JWKS for performance (Clerk's public keys)
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksCacheExpiry = 0;
const JWKS_CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get or create JWKS key set from Clerk
 */
function getJWKS(clerkIssuerUrl: string): ReturnType<typeof createRemoteJWKSet> {
  const now = Date.now();
  
  if (jwksCache && now < jwksCacheExpiry) {
    return jwksCache;
  }
  
  // Clerk JWKS endpoint is at /.well-known/jwks.json relative to the issuer
  const jwksUrl = new URL('/.well-known/jwks.json', clerkIssuerUrl);
  console.log('Creating JWKS key set from:', jwksUrl.toString());
  
  jwksCache = createRemoteJWKSet(jwksUrl);
  jwksCacheExpiry = now + JWKS_CACHE_TTL;
  
  return jwksCache;
}

/**
 * Verify Clerk JWT from Authorization header using JWKS-based signature verification
 * Returns the verified user ID or an error
 */
export async function verifyClerkJWT(req: Request): Promise<VerifyResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    console.warn('No Authorization header provided');
    return { success: false, error: 'No authorization header provided', status: 401 };
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.warn('Invalid Authorization header format');
    return { success: false, error: 'Invalid authorization header format', status: 401 };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token) {
    console.warn('Empty token in Authorization header');
    return { success: false, error: 'No token provided', status: 401 };
  }

  // Get Clerk issuer URL from environment
  const clerkIssuerUrl = Deno.env.get('CLERK_ISSUER_URL');
  if (!clerkIssuerUrl) {
    console.error('CLERK_ISSUER_URL environment variable is not set');
    return { success: false, error: 'Authentication service not configured', status: 500 };
  }

  try {
    // Get JWKS key set (cached)
    const jwks = getJWKS(clerkIssuerUrl);
    
    // Verify the JWT signature and claims
    const { payload } = await jwtVerify(token, jwks, {
      issuer: clerkIssuerUrl,
      // Clerk tokens don't always have an audience, so we skip that check
      // The issuer check is sufficient for validating the token source
    });

    const clerkPayload = payload as ClerkJWTPayload;

    // Validate required claims
    if (!clerkPayload.sub) {
      console.warn('No sub claim in verified token');
      return { success: false, error: 'Invalid token: missing user ID', status: 401 };
    }

    // Token is cryptographically verified and valid
    console.log('JWT signature verified successfully:', { 
      userId: clerkPayload.sub,
      issuer: clerkPayload.iss,
      expiresAt: clerkPayload.exp ? new Date(clerkPayload.exp * 1000).toISOString() : 'none'
    });
    
    return {
      success: true,
      userId: clerkPayload.sub,
      email: clerkPayload.email,
    };

  } catch (error) {
    // Handle specific JWT verification errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('expired')) {
        console.warn('Token expired:', error.message);
        return { success: false, error: 'Token expired', status: 401 };
      }
      
      if (errorMessage.includes('signature')) {
        console.warn('Invalid token signature:', error.message);
        return { success: false, error: 'Invalid token signature', status: 401 };
      }
      
      if (errorMessage.includes('issuer')) {
        console.warn('Invalid token issuer:', error.message);
        return { success: false, error: 'Invalid token issuer', status: 401 };
      }

      if (errorMessage.includes('jwk') || errorMessage.includes('key')) {
        console.error('JWKS fetch or key error:', error.message);
        return { success: false, error: 'Authentication service temporarily unavailable', status: 503 };
      }
      
      console.error('JWT verification failed:', error.message);
    } else {
      console.error('JWT verification failed with unknown error:', error);
    }
    
    return { success: false, error: 'Token verification failed', status: 401 };
  }
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
