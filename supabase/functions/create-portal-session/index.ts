import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // Verify Clerk JWT and extract user ID (JWKS-based signature verification)
    const authResult = await verifyClerkJWT(req);
    
    if (!authResult.success) {
      logStep('Auth failed', { error: authResult.error });
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    const userId = authResult.userId;
    const emailFromToken = authResult.email;
    logStep('User authenticated via Clerk JWT', { userId, email: emailFromToken });

    // Initialize Supabase client with service role to query stripe_customers
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    // First, try to find Stripe customer in our database (more reliable)
    const { data: stripeCustomerData, error: stripeCustomerError } = await supabaseClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    let customerId: string | null = stripeCustomerData?.stripe_customer_id || null;

    if (stripeCustomerError) {
      logStep('Error querying stripe_customers table', { error: stripeCustomerError.message });
    }

    // If not found in our DB, fall back to searching Stripe by email
    if (!customerId && emailFromToken) {
      logStep('Customer not found in DB, searching Stripe by email', { email: emailFromToken });
      const customers = await stripe.customers.list({ email: emailFromToken, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep('Found Stripe customer by email', { customerId });
      }
    }

    if (!customerId) {
      throw new Error('No Stripe customer found for this user. Please subscribe first.');
    }

    logStep('Found Stripe customer', { customerId });

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    logStep('Portal session created', { sessionId: portalSession.id });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
