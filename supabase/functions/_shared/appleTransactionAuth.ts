/**
 * Verifies Apple StoreKit 2 signed transaction JWS server-side.
 *
 * The client sends `signedTransactionInfo` — the raw
 * `Transaction.jwsRepresentation` string StoreKit produced on-device. This
 * module is the sole trust boundary for granting a paid plan from a native
 * Apple purchase: nothing the client claims about the transaction (product
 * ID, expiration, subscription status) is trusted until the signature and
 * certificate chain below verify successfully.
 *
 * Verification steps:
 *   1. Parse the compact JWS (header.payload.signature) and its header.
 *   2. Read the x5c certificate chain from the JWS header (leaf first).
 *   3. Verify the chain: each certificate was signed by the next one's key,
 *      terminating at a certificate matching our independently embedded
 *      Apple root — never a root the JWS itself supplies.
 *   4. Verify the JWS signature (ES256) using the leaf certificate's public
 *      key.
 *   5. Only after (1)-(4) succeed, parse and return the JWS payload claims.
 *
 * KNOWN LIMITATION: this code has not been executed against a real
 * Apple-signed transaction in this environment (no live sandbox purchase
 * available here) and must be tested against a real TestFlight sandbox
 * transaction before being trusted in production.
 */

import { X509Certificate } from "https://esm.sh/@peculiar/x509@1.12.1";
import { importX509, compactVerify } from "https://deno.land/x/jose@v5.2.2/index.ts";

// Apple Root CA - G3 — the trust anchor for StoreKit 2 / App Store Server
// signed transaction and renewal info JWS.
//
// Certificate:    Apple Root CA - G3
// Source:         Apple PKI / Certificate Authority (official)
// SHA-256:        63:34:3A:BF:B8:9A:6A:03:EB:B5:7E:9B:3F:5F:A7:BE:
//                 7C:4F:5C:75:6F:30:17:B3:A8:C4:88:C3:65:3E:91:79
// Retrieved:      2026-07-17
//
// Do not replace this value with a certificate from any other source
// (a client-supplied JWS, a third-party mirror, a code snippet, etc.).
const APPLE_ROOT_CA_G3_PEM = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`;

// Apple's documented extension identifying WWDR-family intermediate
// certificates used to sign App Store / StoreKit data.
const APPLE_WWDR_EXTENSION_OID = "1.2.840.113635.100.6.2.1";

export interface AppleTransactionClaims {
  transactionId: string;
  originalTransactionId: string;
  bundleId: string;
  productId: string;
  purchaseDate: number;
  expiresDate?: number;
  revocationDate?: number;
  environment: "Sandbox" | "Production";
  type: string;
  signedDate: number;
}

// Runtime shape check for the parsed JWS payload — rejects type-confused
// values (e.g. expiresDate as a string, empty productId, a malformed
// environment) before any caller can treat the payload as trustworthy.
// TypeScript's AppleTransactionClaims type only guarantees shape at compile
// time; the payload itself is attacker-influenced input (Apple's signature
// only proves *Apple* produced these exact bytes, not that our TS types
// describe them correctly), so every field is checked at runtime here.
function isValidClaimsShape(value: unknown): value is AppleTransactionClaims {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  if (typeof c.transactionId !== "string" || c.transactionId.length === 0) return false;
  if (typeof c.originalTransactionId !== "string" || c.originalTransactionId.length === 0) {
    return false;
  }
  if (typeof c.bundleId !== "string" || c.bundleId.length === 0) return false;
  if (typeof c.productId !== "string" || c.productId.length === 0) return false;
  if (typeof c.purchaseDate !== "number") return false;
  if (c.expiresDate !== undefined && typeof c.expiresDate !== "number") return false;
  if (
    c.revocationDate !== undefined &&
    c.revocationDate !== null &&
    typeof c.revocationDate !== "number"
  ) {
    return false;
  }
  if (c.environment !== "Sandbox" && c.environment !== "Production") return false;
  if (typeof c.type !== "string" || c.type.length === 0) return false;
  if (typeof c.signedDate !== "number") return false;
  return true;
}

export type AppleVerifyResult =
  | { verified: true; claims: AppleTransactionClaims }
  | { verified: false; error: string };

function base64UrlToUint8Array(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function derToPem(der: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < der.length; i++) binary += String.fromCharCode(der[i]);
  const b64 = btoa(binary);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN CERTIFICATE-----\n${lines.join("\n")}\n-----END CERTIFICATE-----`;
}

/**
 * Verifies a StoreKit 2 signed transaction JWS. Never throws — every
 * failure path returns { verified: false, error }. signedTransactionInfo
 * itself is never logged by this function; callers must not log it either.
 *
 * trustedRootPemOverride exists solely so tests can exercise the full
 * chain/signature/payload path with a self-generated, clearly-fake test
 * certificate chain instead of a real Apple-signed transaction (which this
 * codebase has no way to produce). No production call site passes this
 * parameter — it always defaults to the real embedded Apple root.
 */
export async function verifyAppleSignedTransaction(
  signedTransactionInfo: string,
  trustedRootPemOverride?: string,
): Promise<AppleVerifyResult> {
  if (!signedTransactionInfo || typeof signedTransactionInfo !== "string") {
    return { verified: false, error: "MISSING_TRANSACTION" };
  }

  const parts = signedTransactionInfo.split(".");
  if (parts.length !== 3) {
    return { verified: false, error: "MALFORMED_JWS" };
  }

  let header: { alg?: string; x5c?: string[] };
  try {
    header = JSON.parse(
      new TextDecoder().decode(base64UrlToUint8Array(parts[0])),
    );
  } catch {
    return { verified: false, error: "MALFORMED_HEADER" };
  }

  if (header.alg !== "ES256") {
    return { verified: false, error: "UNSUPPORTED_ALGORITHM" };
  }
  if (!header.x5c || header.x5c.length < 2) {
    return { verified: false, error: "MISSING_CERTIFICATE_CHAIN" };
  }

  // x5c entries are standard base64-encoded DER certificates per RFC 7515
  // §4.1.6 — NOT base64url. @peculiar/x509 accepts a base64 DER string
  // directly.
  let chain: X509Certificate[];
  try {
    chain = header.x5c.map((certB64) => new X509Certificate(certB64));
  } catch {
    return { verified: false, error: "MALFORMED_CERTIFICATE" };
  }

  let trustedRoot: X509Certificate;
  try {
    trustedRoot = new X509Certificate(trustedRootPemOverride ?? APPLE_ROOT_CA_G3_PEM);
  } catch {
    return { verified: false, error: "TRUSTED_ROOT_NOT_CONFIGURED" };
  }

  // Verify each certificate in the chain was signed by the next one's key,
  // and that the chain terminates at our independently embedded trusted
  // root — never trusting a root the JWS itself supplies.
  try {
    for (let i = 0; i < chain.length - 1; i++) {
      const isValid = await chain[i].verify({ publicKey: chain[i + 1].publicKey });
      if (!isValid) return { verified: false, error: "BROKEN_CERTIFICATE_CHAIN" };
    }

    const lastInChain = chain[chain.length - 1];
    const lastVerifiesAgainstRoot = await lastInChain.verify({
      publicKey: trustedRoot.publicKey,
    });
    const lastIsRootItself =
      lastInChain.subject === trustedRoot.subject &&
      lastInChain.serialNumber === trustedRoot.serialNumber;
    if (!lastVerifiesAgainstRoot && !lastIsRootItself) {
      return { verified: false, error: "UNTRUSTED_ROOT" };
    }

    // Sanity-check that the intermediate is specifically an Apple
    // WWDR-family certificate, not merely any certificate that happens to
    // chain to the same root. Only meaningful when lastInChain is the
    // intermediate itself (the normal case — Apple's x5c is documented as
    // [leaf, intermediate], with the root verified separately as above,
    // never included in x5c). Skipped if lastInChain is the root itself,
    // since the root does not carry this extension.
    if (!lastIsRootItself) {
      const hasWwdrExtension = lastInChain.extensions.some(
        (ext: { type: string }) => ext.type === APPLE_WWDR_EXTENSION_OID,
      );
      if (!hasWwdrExtension) {
        return { verified: false, error: "MISSING_APPLE_WWDR_EXTENSION" };
      }
    }

    const now = new Date();
    // Includes the embedded trusted root itself — a chain should never be
    // accepted on the strength of a root we believe to be currently
    // outside its own validity window, even though this root's validity
    // window (2014-2039) makes that scenario unlikely for a long time.
    for (const cert of [...chain, trustedRoot]) {
      if (now < cert.notBefore || now > cert.notAfter) {
        return { verified: false, error: "CERTIFICATE_EXPIRED" };
      }
    }
  } catch {
    return { verified: false, error: "CHAIN_VERIFICATION_FAILED" };
  }

  // Verify the JWS signature itself using the leaf certificate's public
  // key. The `algorithms` option is redundant with the header.alg check
  // above but is set explicitly anyway as defense-in-depth: jose will
  // refuse to verify with any algorithm other than ES256 even if the
  // header-parsing logic above were ever changed or bypassed.
  let payloadBytes: Uint8Array;
  try {
    const leafPem = derToPem(new Uint8Array(chain[0].rawData));
    const leafKey = await importX509(leafPem, "ES256");
    const verifyResult = await compactVerify(signedTransactionInfo, leafKey, {
      algorithms: ["ES256"],
    });
    payloadBytes = verifyResult.payload;
  } catch {
    return { verified: false, error: "INVALID_SIGNATURE" };
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return { verified: false, error: "MALFORMED_PAYLOAD" };
  }

  if (!isValidClaimsShape(parsedPayload)) {
    return { verified: false, error: "INVALID_CLAIMS_SHAPE" };
  }

  return { verified: true, claims: parsedPayload };
}

export const APPLE_BUNDLE_ID = "com.abe.BetterOpnr";

export const ALLOWED_APPLE_PRODUCT_IDS: Record<string, "monthly" | "yearly"> = {
  "betteropnr.premium.monthly": "monthly",
  "betteropnr.premium.yearly": "yearly",
};

export type ClaimsValidationResult =
  | { ok: true; planInterval: "monthly" | "yearly" }
  | { ok: false; error: string };

/**
 * Business-logic checks applied to an already-signature-verified set of
 * claims (i.e. only ever called with the `claims` from a `{ verified: true }`
 * AppleVerifyResult). Pure and synchronous, so it is independently testable
 * with a hand-constructed AppleTransactionClaims object — no signature or
 * certificate chain involved.
 */
export function validateTransactionClaims(
  claims: AppleTransactionClaims,
): ClaimsValidationResult {
  if (claims.bundleId !== APPLE_BUNDLE_ID) {
    return { ok: false, error: "WRONG_BUNDLE" };
  }

  const planInterval = ALLOWED_APPLE_PRODUCT_IDS[claims.productId];
  if (!planInterval) {
    return { ok: false, error: "UNKNOWN_PRODUCT" };
  }

  if (claims.revocationDate) {
    return { ok: false, error: "REVOKED" };
  }

  if (!claims.expiresDate || claims.expiresDate <= Date.now()) {
    return { ok: false, error: "EXPIRED" };
  }

  if (claims.environment !== "Sandbox" && claims.environment !== "Production") {
    return { ok: false, error: "INVALID_ENVIRONMENT" };
  }

  // signedDate sanity bound: catches an implausible value (e.g. 0, a
  // negative number, or something far in the future due to clock skew or a
  // malformed payload that nonetheless passed the numeric type check)
  // without being so strict that ordinary clock drift between Apple and
  // this server rejects a legitimate transaction.
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const EARLIEST_PLAUSIBLE_SIGNED_DATE = Date.parse("2020-01-01T00:00:00Z");
  if (
    claims.signedDate < EARLIEST_PLAUSIBLE_SIGNED_DATE ||
    claims.signedDate > Date.now() + FIVE_MINUTES_MS
  ) {
    return { ok: false, error: "IMPLAUSIBLE_SIGNED_DATE" };
  }

  return { ok: true, planInterval };
}
