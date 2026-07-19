import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyClerkJWT, createAuthErrorResponse } from "../_shared/clerkAuth.ts";
import {
  verifyAppleSignedTransaction,
  validateTransactionClaims,
} from "../_shared/appleTransactionAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SECURITY: the authenticated user comes only from the verified Clerk
    // JWT. clerk_user_id / user_id / plan / productId / expirationDate /
    // isSubscribed are never read from the request body — the only body
    // field this function accepts is signedTransactionInfo, and even that
    // is not trusted until independently verified below.
    const authResult = await verifyClerkJWT(req);
    if (!authResult.success) {
      console.error("[sync-apple-subscription] Auth failed:", authResult.error);
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }
    const userId = authResult.userId;

    let body: { signedTransactionInfo?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ verified: false, error: "INVALID_JSON" }, 400);
    }

    if (typeof body.signedTransactionInfo !== "string" || !body.signedTransactionInfo) {
      return jsonResponse({ verified: false, error: "MISSING_TRANSACTION" }, 400);
    }

    // NOTE: never log body.signedTransactionInfo — it is Apple-signed
    // evidence of a real purchase and should be handled like a bearer
    // credential, not debug output.
    const verifyResult = await verifyAppleSignedTransaction(body.signedTransactionInfo);
    if (!verifyResult.verified) {
      console.error("[sync-apple-subscription] Verification failed:", verifyResult.error);
      return jsonResponse({ verified: false, error: verifyResult.error }, 400);
    }

    const claims = verifyResult.claims;

    const claimsCheck = validateTransactionClaims(claims);
    if (!claimsCheck.ok) {
      console.error("[sync-apple-subscription] Claims validation failed:", claimsCheck.error, {
        transactionId: claims.transactionId,
      });
      return jsonResponse({ verified: false, error: claimsCheck.error }, 400);
    }
    const planInterval = claimsCheck.planInterval;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ plan: "pro", plan_interval: planInterval })
      .eq("clerk_user_id", userId)
      .select("clerk_user_id, plan, plan_interval")
      .maybeSingle();

    if (updateError) {
      console.error("[sync-apple-subscription] Database update failed:", updateError);
      return jsonResponse({ verified: false, error: "DATABASE_UPDATE_FAILED" }, 500);
    }

    if (!updated) {
      console.error("[sync-apple-subscription] No matching user for clerk_user_id:", userId);
      return jsonResponse({ verified: false, error: "USER_NOT_FOUND" }, 404);
    }

    console.log("[sync-apple-subscription] Plan synced:", {
      userId,
      plan: updated.plan,
      planInterval: updated.plan_interval,
      productId: claims.productId,
      environment: claims.environment,
    });

    return jsonResponse({
      verified: true,
      plan: updated.plan,
      planInterval: updated.plan_interval,
      productId: claims.productId,
      expiresDate: claims.expiresDate,
    });
  } catch (error) {
    console.error("[sync-apple-subscription] Unexpected error:", error);
    return jsonResponse({ verified: false, error: "SERVER_ERROR" }, 500);
  }
});
