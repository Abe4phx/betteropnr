import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trusted domains for return_url
const TRUSTED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'lovableproject.com',
  'lovable.app',
  'betteropnr.com',
];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PORTAL] ${step}${detailsStr}`);
};

/**
 * Validate that the origin is from a trusted domain
 */
function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    
    // Check exact match or subdomain match for trusted domains
    return TRUSTED_DOMAINS.some(trusted => 
      hostname === trusted || hostname.endsWith(`.${trusted}`)
    );
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // 1. Authenticate using VERIFIED Clerk JWT (JWKS signature verification)
    const authResult = await verifyClerkJWT(req);
    
    if (!authResult.success) {
      logStep('Auth failed', { error: authResult.error });
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    // 2. Get userId from verified token sub (cryptographically verified)
    const userId = authResult.userId;
    logStep('User authenticated via Clerk JWT', { userId });

    // Validate origin for return_url security
    const origin = req.headers.get('origin');
    if (!isValidOrigin(origin)) {
      logStep('Invalid origin rejected', { origin });
      return new Response(
        JSON.stringify({ error: 'Invalid request origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logStep('Origin validated', { origin });

    // Initialize Supabase client with service role for database access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 3. Look up Stripe customer ID server-side using verified userId
    // NEVER accept customer ID from client - always derive from authenticated user
    const { data: stripeCustomerData, error: stripeCustomerError } = await supabaseClient
      .from('stripe_customers')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (stripeCustomerError) {
      logStep('Database error looking up stripe customer', { error: stripeCustomerError.message });
      return new Response(
        JSON.stringify({ error: 'Failed to verify subscription status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reject if no customer record found
    if (!stripeCustomerData?.stripe_customer_id) {
      logStep('No Stripe customer found for user', { userId });
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found for user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customerId = stripeCustomerData.stripe_customer_id;
    logStep('Found Stripe customer from database', { customerId });

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      logStep('STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    // 7. Additional abuse protection: Verify customer has active/past subscription in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep('Customer has no subscription history', { customerId });
      return new Response(
        JSON.stringify({ error: 'No subscription found to manage. Please subscribe first.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Subscription verified', { 
      subscriptionId: subscriptions.data[0].id,
      status: subscriptions.data[0].status 
    });

    // 4 & 6. Create Stripe billing portal session with trusted return_url
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    logStep('Portal session created', { sessionId: portalSession.id });

    // 5. Return the portal URL
    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(
      JSON.stringify({ error: 'An error occurred while creating the billing portal session' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
