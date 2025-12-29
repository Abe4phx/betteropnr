/**
 * Clerk JWT Authentication Helper for Supabase Edge Functions
 * Verifies Clerk JWTs using JWKS-based cryptographic signature verification
 * Filters JWKS to only use supported algorithms (excludes EdDSA)
 */

import { importJWK, jwtVerify, JWTPayload, decodeProtectedHeader } from "https://deno.land/x/jose@v5.2.2/index.ts";

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

// Supported algorithms - excludes EdDSA which causes issues
const SUPPORTED_ALGORITHMS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];

// Cache for fetched and filtered JWKS
interface JWKSCache {
  keys: Map<string, CryptoKey>;
  expiry: number;
}

let jwksCache: JWKSCache | null = null;
const JWKS_CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Fetch JWKS from Clerk and filter to only supported algorithms
 */
async function fetchAndFilterJWKS(clerkIssuerUrl: string): Promise<Map<string, CryptoKey>> {
  const now = Date.now();
  
  // Return cached keys if still valid
  if (jwksCache && now < jwksCache.expiry) {
    return jwksCache.keys;
  }
  
  const jwksUrl = new URL('/.well-known/jwks.json', clerkIssuerUrl);
  console.log('Fetching JWKS from:', jwksUrl.toString());
  
  const response = await fetch(jwksUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`);
  }
  
  const jwks = await response.json();
  const keys = new Map<string, CryptoKey>();
  
  // Filter and import only supported algorithm keys
  for (const jwk of jwks.keys) {
    if (!jwk.alg || !SUPPORTED_ALGORITHMS.includes(jwk.alg)) {
      console.log(`Skipping key with unsupported algorithm: ${jwk.alg || 'none'}`);
      continue;
    }
    
    if (!jwk.kid) {
      console.log('Skipping key without kid');
      continue;
    }
    
    try {
      const cryptoKey = await importJWK(jwk, jwk.alg);
      keys.set(jwk.kid, cryptoKey as CryptoKey);
      console.log(`Imported key: ${jwk.kid} (${jwk.alg})`);
    } catch (err) {
      console.warn(`Failed to import key ${jwk.kid}:`, err);
    }
  }
  
  if (keys.size === 0) {
    throw new Error('No valid keys found in JWKS');
  }
  
  // Cache the keys
  jwksCache = {
    keys,
    expiry: now + JWKS_CACHE_TTL
  };
  
  console.log(`Cached ${keys.size} valid keys`);
  return keys;
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
    // Decode the JWT header to get the key ID (kid)
    const header = decodeProtectedHeader(token);
    const kid = header.kid;
    
    if (!kid) {
      console.warn('No kid in JWT header');
      return { success: false, error: 'Invalid token: missing key ID', status: 401 };
    }
    
    // Fetch and filter JWKS
    const keys = await fetchAndFilterJWKS(clerkIssuerUrl);
    
    // Find the key matching the JWT's kid
    const key = keys.get(kid);
    if (!key) {
      console.warn(`No matching key found for kid: ${kid}`);
      // Clear cache and retry once in case keys were rotated
      jwksCache = null;
      const freshKeys = await fetchAndFilterJWKS(clerkIssuerUrl);
      const freshKey = freshKeys.get(kid);
      if (!freshKey) {
        return { success: false, error: 'Token signing key not found', status: 401 };
      }
    }
    
    const verificationKey = keys.get(kid) || (await fetchAndFilterJWKS(clerkIssuerUrl)).get(kid);
    if (!verificationKey) {
      return { success: false, error: 'Token signing key not found', status: 401 };
    }
    
    // Verify the JWT signature and claims
    const { payload } = await jwtVerify(token, verificationKey, {
      issuer: clerkIssuerUrl,
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

      if (errorMessage.includes('fetch')) {
        console.error('JWKS fetch error:', error.message);
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
