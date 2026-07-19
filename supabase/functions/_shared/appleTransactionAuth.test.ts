/**
 * Tests for verifyAppleSignedTransaction / validateTransactionClaims.
 *
 * Run with: deno test supabase/functions/_shared/appleTransactionAuth.test.ts
 *
 * IMPORTANT: none of the certificate/key material below is Apple's. It is a
 * self-generated, throwaway test-only PKI (root/intermediate/leaf), created
 * solely to exercise the chain-verification and signature-verification code
 * paths end to end without needing a real Apple-signed transaction, which
 * this environment has no way to produce. It is passed to
 * verifyAppleSignedTransaction() only via its explicit test-only
 * `trustedRootPemOverride` parameter — no production code path can reach it.
 * Do not mistake this fixture for real Apple certificate material, and do
 * not add real customer transaction JWS values to this file.
 */

import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { verifyAppleSignedTransaction, validateTransactionClaims } from "./appleTransactionAuth.ts";

// ---- Test-only fixture PKI (NOT Apple) -------------------------------

const TEST_ROOT_PEM = `-----BEGIN CERTIFICATE-----
MIIB4jCCAYmgAwIBAgIUGx8xdxXx4Th4ckn4I5oPCI35ArcwCgYIKoZIzj0EAwIw
RzEpMCcGA1UEAwwgQmV0dGVyT3BuciBUZXN0IFJvb3QgKE5PVCBBUFBMRSkxGjAY
BgNVBAoMEVRlc3QgRml4dHVyZSBPbmx5MB4XDTI2MDcxODA1MTQ0M1oXDTM2MDcx
NTA1MTQ0M1owRzEpMCcGA1UEAwwgQmV0dGVyT3BuciBUZXN0IFJvb3QgKE5PVCBB
UFBMRSkxGjAYBgNVBAoMEVRlc3QgRml4dHVyZSBPbmx5MFkwEwYHKoZIzj0CAQYI
KoZIzj0DAQcDQgAEmDPopKRfgA84HkY+fyP9T8/IPrz5zL/twU32HE1eXdCLHgJX
h30TnTK0c41QvfeNLXRAZ5B+C33VYBgr3aIljaNTMFEwHQYDVR0OBBYEFJKY2wNV
ltmYP7BrrbvnAlfRST5hMB8GA1UdIwQYMBaAFJKY2wNVltmYP7BrrbvnAlfRST5h
MA8GA1UdEwEB/wQFMAMBAf8wCgYIKoZIzj0EAwIDRwAwRAIgIdzyUCKDynmZQ0ZV
9wcyFLBbfWugmz+XfgpvQhNsqRYCIG7Eawv+bMQPaycC2b8KvZ3GdULJ4Mo4ahrn
erPNmI8P
-----END CERTIFICATE-----`;

const TEST_LEAF_DER_B64 =
  "MIIB9TCCAZugAwIBAgIUdsRv4emkL3y64xQAUknk1IplVm0wCgYIKoZIzj0EAwIwTzExMC8GA1UEAwwoQmV0dGVyT3BuciBUZXN0IEludGVybWVkaWF0ZSAoTk9UIEFQUExFKTEaMBgGA1UECgwRVGVzdCBGaXh0dXJlIE9ubHkwHhcNMjYwNzE4MDUxNDQzWhcNMzYwNzE1MDUxNDQzWjBHMSkwJwYDVQQDDCBCZXR0ZXJPcG5yIFRlc3QgTGVhZiAoTk9UIEFQUExFKTEaMBgGA1UECgwRVGVzdCBGaXh0dXJlIE9ubHkwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAS2BzRaC5QjV+baXLM7KsOOt6p7ApbcGV1j0JIQ6dRSkcQbz2Kdwv7pOdVTj2YFo18U1fxtHmj5dLdaYjHH6IoAo10wWzAJBgNVHRMEAjAAMA4GA1UdDwEB/wQEAwIHgDAdBgNVHQ4EFgQUOQwcu9t9pk182FFgqTmDo/dN6F0wHwYDVR0jBBgwFoAUI73iNNLuGsGl61NXRP/ghH1Kmu0wCgYIKoZIzj0EAwIDSAAwRQIhANbeeyZrRpedsRlwebTW/ig+MG1+iSrWYCpeNDzAMXS4AiBNnW1Pif69vCrakFrtUtv0PUYOptdoL2yD5wRXXV+sWQ==";

const TEST_INTERMEDIATE_DER_B64 =
  "MIICEDCCAbagAwIBAgIUA/gOL2cXbZj2D3KEXkMaiJ9DfuswCgYIKoZIzj0EAwIwRzEpMCcGA1UEAwwgQmV0dGVyT3BuciBUZXN0IFJvb3QgKE5PVCBBUFBMRSkxGjAYBgNVBAoMEVRlc3QgRml4dHVyZSBPbmx5MB4XDTI2MDcxODA1MTQ0M1oXDTM2MDcxNTA1MTQ0M1owTzExMC8GA1UEAwwoQmV0dGVyT3BuciBUZXN0IEludGVybWVkaWF0ZSAoTk9UIEFQUExFKTEaMBgGA1UECgwRVGVzdCBGaXh0dXJlIE9ubHkwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATtk276P4IAabpMKKkT0nY3SofloM3/HseLcmczRUrWsivmkSPN/mKV96p5bA9u6Hgm/g7YI/tFQf5X9ZqcQ9R7o3gwdjASBgNVHRMBAf8ECDAGAQH/AgEAMA4GA1UdDwEB/wQEAwIBBjAQBgoqhkiG92NkBgIBBAIFADAdBgNVHQ4EFgQUI73iNNLuGsGl61NXRP/ghH1Kmu0wHwYDVR0jBBgwFoAUkpjbA1WW2Zg/sGutu+cCV9FJPmEwCgYIKoZIzj0EAwIDSAAwRQIhAOT+38LqWCTlNNZE+fc4e05i7nJwA1ToRrrvG0o+qVGeAiB817Zpq9z4Db9FAmWuo5WHVV3SWfVwFiQfKVx5ILpuXg==";

const TEST_UNRELATED_DER_B64 =
  "MIIByTCCAW+gAwIBAgIUOJIUStbClZW86MDvCLyfm8rm8xIwCgYIKoZIzj0EAwIwOjEcMBoGA1UEAwwTVW5yZWxhdGVkIFRlc3QgQ2VydDEaMBgGA1UECgwRVGVzdCBGaXh0dXJlIE9ubHkwHhcNMjYwNzE4MDUxNDQzWhcNMzYwNzE1MDUxNDQzWjA6MRwwGgYDVQQDDBNVbnJlbGF0ZWQgVGVzdCBDZXJ0MRowGAYDVQQKDBFUZXN0IEZpeHR1cmUgT25seTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABGOWHFHnoVNXIn3eWJjL1vxtlNFy1SHiL2atjPFjLpPz6Wrgzs5/SrIfv1cysrf8yI0V8u0QSMx1cw18/8PejIajUzBRMB0GA1UdDgQWBBQmxgNIGJytlN4QOqbXSmtg3iWsQjAfBgNVHSMEGDAWgBQmxgNIGJytlN4QOqbXSmtg3iWsQjAPBgNVHRMBAf8EBTADAQH/MAoGCCqGSM49BAMCA0gAMEUCIAcTpVW+in0WUhbcYFtt/VbDsS04TpY53ogWw6ACneXEAiEAvE/E3630+gzBx28Z04B2LMuMzbeHpkwLYUcPGqmmLOo=";

const TEST_MIDLEAF_DER_B64 =
  "MIIB1TCCAXugAwIBAgIUNYxghpR++hNNx+vJSuVbrmSe6QgwCgYIKoZIzj0EAwIwNjEYMBYGA1UEAwwPV3JvbmcgVGVzdCBSb290MRowGAYDVQQKDBFUZXN0IEZpeHR1cmUgT25seTAeFw0yNjA3MTgwNTE0NDNaFw0zNjA3MTUwNTE0NDNaMEAxIjAgBgNVBAMMGUxlYWYgU2lnbmVkIEJ5IFdyb25nIFJvb3QxGjAYBgNVBAoMEVRlc3QgRml4dHVyZSBPbmx5MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEl0ISKUmtQ6MqddvjCLfo8WUtegPRGHDZHXyW4HgmTvHw5FOiHIBmwz66EzeW5NPBBWFFeMnqxSyEqIVrDzejK6NdMFswCQYDVR0TBAIwADAOBgNVHQ8BAf8EBAMCB4AwHQYDVR0OBBYEFMlyc0H0kSMvPFA5hjTrNM52lYQKMB8GA1UdIwQYMBaAFKvPsNQORWohlkLqQNJ67JFC+K4iMAoGCCqGSM49BAMCA0gAMEUCIQCZ0/A2zF8Lk80srJIQzspja7FD1GuSlassUZ3PxDYrXgIgAf/H6KMOgAnUQxkA2yghfta3jbcDPx/2jcaWDYofWF4=";

const TEST_WRONGROOT_DER_B64 =
  "MIIBwDCCAWegAwIBAgIUINe9V0nCTcZrwRfE8p/xmmSgETowCgYIKoZIzj0EAwIwNjEYMBYGA1UEAwwPV3JvbmcgVGVzdCBSb290MRowGAYDVQQKDBFUZXN0IEZpeHR1cmUgT25seTAeFw0yNjA3MTgwNTE0NDNaFw0zNjA3MTUwNTE0NDNaMDYxGDAWBgNVBAMMD1dyb25nIFRlc3QgUm9vdDEaMBgGA1UECgwRVGVzdCBGaXh0dXJlIE9ubHkwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQNxB24laGggAdtiS7/HU1usTtMpFF5FWUzml/QJ0sF+LWgq83U33uoNZtqAcx57G/2iR4tm9UpPcqQygD5/bfoo1MwUTAdBgNVHQ4EFgQUq8+w1A5FaiGWQupA0nrskUL4riIwHwYDVR0jBBgwFoAUq8+w1A5FaiGWQupA0nrskUL4riIwDwYDVR0TAQH/BAUwAwEB/zAKBggqhkjOPQQDAgNHADBEAiBkfUxjqlxHKEeGnDCljcNQApGnPq+/hOql3mAhfQwpcAIgeKTCNEH/rPN5BhnokiulXtIpZQuU997RccA5EdkTDq4=";

const TEST_LEAF_PRIVATE_KEY_PKCS8_PEM = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgqB2jDHJGRaiOKhDQ
u5FMKravG2qUpn8o5edRKh8gdWahRANCAAS2BzRaC5QjV+baXLM7KsOOt6p7Apbc
GV1j0JIQ6dRSkcQbz2Kdwv7pOdVTj2YFo18U1fxtHmj5dLdaYjHH6IoA
-----END PRIVATE KEY-----`;

// ---- JWS-building helpers (test-only) ---------------------------------

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importTestLeafPrivateKey(): Promise<CryptoKey> {
  const b64 = TEST_LEAF_PRIVATE_KEY_PKCS8_PEM.replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const der = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) der[i] = binary.charCodeAt(i);
  return crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

/** Builds a real, cryptographically valid ES256 JWS signed with the test
 * leaf's private key — used to exercise the full verification path. */
async function buildTestJws(payload: Record<string, unknown>, x5c: string[]): Promise<string> {
  const header = { alg: "ES256", x5c };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await importTestLeafPrivateKey();
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function validPayload(overrides: Record<string, unknown> = {}) {
  const now = Date.now();
  return {
    transactionId: "1000000000000001",
    originalTransactionId: "1000000000000001",
    bundleId: "com.abe.BetterOpnr",
    productId: "betteropnr.premium.monthly",
    purchaseDate: now - 1000,
    expiresDate: now + 30 * 24 * 60 * 60 * 1000,
    environment: "Sandbox",
    type: "Auto-Renewable Subscription",
    signedDate: now,
    ...overrides,
  };
}

// ---- Tests --------------------------------------------------------------

Deno.test("1. rejects malformed JWS (wrong number of segments)", async () => {
  const result = await verifyAppleSignedTransaction("not-a-valid-jws");
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "MALFORMED_JWS");
});

Deno.test("2. rejects JWS with missing x5c", async () => {
  const header = { alg: "ES256" };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(validPayload())));
  const jws = `${headerB64}.${payloadB64}.fakesig`;
  const result = await verifyAppleSignedTransaction(jws);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "MISSING_CERTIFICATE_CHAIN");
});

Deno.test("3a. rejects wrong algorithm (alg=none)", async () => {
  const header = { alg: "none", x5c: [TEST_LEAF_DER_B64, TEST_INTERMEDIATE_DER_B64] };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(validPayload())));
  const jws = `${headerB64}.${payloadB64}.`;
  const result = await verifyAppleSignedTransaction(jws);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "UNSUPPORTED_ALGORITHM");
});

Deno.test("3b. rejects algorithm substitution (alg=HS256)", async () => {
  const header = { alg: "HS256", x5c: [TEST_LEAF_DER_B64, TEST_INTERMEDIATE_DER_B64] };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(validPayload())));
  const jws = `${headerB64}.${payloadB64}.fakesig`;
  const result = await verifyAppleSignedTransaction(jws);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "UNSUPPORTED_ALGORITHM");
});

Deno.test("4a. rejects malformed certificate (invalid base64/DER)", async () => {
  const header = { alg: "ES256", x5c: ["!!!not-valid-base64-der!!!", "also-not-valid"] };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(validPayload())));
  const jws = `${headerB64}.${payloadB64}.fakesig`;
  const result = await verifyAppleSignedTransaction(jws);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "MALFORMED_CERTIFICATE");
});

Deno.test("4b. rejects broken certificate chain (unrelated certs)", async () => {
  // leaf was really signed by our test intermediate, not by "unrelated" —
  // chain[0].verify({ publicKey: chain[1].publicKey }) must genuinely fail.
  const jws = await buildTestJws(validPayload(), [TEST_LEAF_DER_B64, TEST_UNRELATED_DER_B64]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "BROKEN_CERTIFICATE_CHAIN");
});

Deno.test("4c. rejects a chain that doesn't terminate at the trusted root", async () => {
  // midleaf really was signed by wrongroot (internally valid chain), but
  // wrongroot does not match our trusted root override.
  const jws = await buildTestJws(validPayload(), [TEST_MIDLEAF_DER_B64, TEST_WRONGROOT_DER_B64]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "UNTRUSTED_ROOT");
});

Deno.test("5. verified transaction with wrong bundleId is rejected by claims validation", async () => {
  const jws = await buildTestJws(validPayload({ bundleId: "com.wrong.bundle" }), [
    TEST_LEAF_DER_B64,
    TEST_INTERMEDIATE_DER_B64,
  ]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, true); // signature + chain are genuinely valid
  if (result.verified) {
    const check = validateTransactionClaims(result.claims);
    assertEquals(check.ok, false);
    if (!check.ok) assertEquals(check.error, "WRONG_BUNDLE");
  }
});

Deno.test("6. verified but expired transaction is rejected", async () => {
  const jws = await buildTestJws(validPayload({ expiresDate: Date.now() - 1000 }), [
    TEST_LEAF_DER_B64,
    TEST_INTERMEDIATE_DER_B64,
  ]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, true);
  if (result.verified) {
    const check = validateTransactionClaims(result.claims);
    assertEquals(check.ok, false);
    if (!check.ok) assertEquals(check.error, "EXPIRED");
  }
});

Deno.test("7. verified but revoked transaction is rejected", async () => {
  const jws = await buildTestJws(validPayload({ revocationDate: Date.now() - 1000 }), [
    TEST_LEAF_DER_B64,
    TEST_INTERMEDIATE_DER_B64,
  ]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, true);
  if (result.verified) {
    const check = validateTransactionClaims(result.claims);
    assertEquals(check.ok, false);
    if (!check.ok) assertEquals(check.error, "REVOKED");
  }
});

Deno.test("8. verified but unknown product is rejected", async () => {
  const jws = await buildTestJws(validPayload({ productId: "com.other.unknown.product" }), [
    TEST_LEAF_DER_B64,
    TEST_INTERMEDIATE_DER_B64,
  ]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, true);
  if (result.verified) {
    const check = validateTransactionClaims(result.claims);
    assertEquals(check.ok, false);
    if (!check.ok) assertEquals(check.error, "UNKNOWN_PRODUCT");
  }
});

Deno.test("9. malformed/unexpected environment value is rejected at the shape check", async () => {
  // isValidClaimsShape() constrains environment to exactly "Sandbox" |
  // "Production", so a bogus value (e.g. StoreKit's local Xcode testing
  // environment, which is a real but non-purchase environment) is caught
  // here — one layer earlier than validateTransactionClaims's own
  // (redundant, defense-in-depth) environment check.
  const jws = await buildTestJws(validPayload({ environment: "Xcode" }), [
    TEST_LEAF_DER_B64,
    TEST_INTERMEDIATE_DER_B64,
  ]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "INVALID_CLAIMS_SHAPE");
});

Deno.test("10. rejects corrupted signature", async () => {
  const jws = await buildTestJws(validPayload(), [TEST_LEAF_DER_B64, TEST_INTERMEDIATE_DER_B64]);
  const parts = jws.split(".");
  const corruptedSig = parts[2].slice(0, -4) + "AAAA";
  const corruptedJws = `${parts[0]}.${parts[1]}.${corruptedSig}`;
  const result = await verifyAppleSignedTransaction(corruptedJws, TEST_ROOT_PEM);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "INVALID_SIGNATURE");
});

Deno.test("happy path: fully valid test-fixture transaction is accepted end to end", async () => {
  const jws = await buildTestJws(validPayload(), [TEST_LEAF_DER_B64, TEST_INTERMEDIATE_DER_B64]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, true);
  if (result.verified) {
    const check = validateTransactionClaims(result.claims);
    assertEquals(check.ok, true);
    if (check.ok) assertEquals(check.planInterval, "monthly");
  }
});

Deno.test("type-confusion: expiresDate as a string is rejected at the shape check", async () => {
  const jws = await buildTestJws(validPayload({ expiresDate: "9999999999999" }), [
    TEST_LEAF_DER_B64,
    TEST_INTERMEDIATE_DER_B64,
  ]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "INVALID_CLAIMS_SHAPE");
});

Deno.test("type-confusion: empty productId is rejected at the shape check", async () => {
  const jws = await buildTestJws(validPayload({ productId: "" }), [
    TEST_LEAF_DER_B64,
    TEST_INTERMEDIATE_DER_B64,
  ]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "INVALID_CLAIMS_SHAPE");
});

Deno.test("type-confusion: missing bundleId is rejected at the shape check", async () => {
  const payload = validPayload();
  delete (payload as Record<string, unknown>).bundleId;
  const jws = await buildTestJws(payload, [TEST_LEAF_DER_B64, TEST_INTERMEDIATE_DER_B64]);
  const result = await verifyAppleSignedTransaction(jws, TEST_ROOT_PEM);
  assertEquals(result.verified, false);
  if (!result.verified) assertEquals(result.error, "INVALID_CLAIMS_SHAPE");
});
