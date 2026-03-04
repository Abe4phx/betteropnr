import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trusted domains for redirect URLs
const TRUSTED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'lovableproject.com',
  'lovable.app',
  'betteropnr.com',
];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    // 1. Verify JWT and extract user ID (JWKS signature verification)
    const authResult = await verifyClerkJWT(req);
    
    if (!authResult.success) {
      logStep('Auth failed', { error: authResult.error });
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    // 2. Extract userId from verified token sub - NEVER trust client
    const userId = authResult.userId;
    const userEmail = authResult.email;
    logStep('User authenticated via Clerk JWT', { userId, email: userEmail });

    // Validate origin for redirect URL security
    const origin = req.headers.get('origin');
    if (!isValidOrigin(origin)) {
      logStep('Invalid origin rejected', { origin });
      return new Response(
        JSON.stringify({ error: 'Invalid request origin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logStep('Origin validated', { origin });

    // 3. Get priceId from request (only non-identity data from client)
    const { priceId } = await req.json();
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logStep('Price ID received', { priceId });

    // Email is required for checkout
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'User email not available from authentication' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      logStep('STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    // 4. Check if Stripe customer already exists in our database for this userId
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: existingCustomer, error: dbError } = await supabaseClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (dbError) {
      logStep('Database error checking existing customer', { error: dbError.message });
      // Non-fatal: continue without existing customer
    }

    let customerId: string | undefined;

    if (existingCustomer?.stripe_customer_id) {
      // Reuse existing Stripe customer from our database
      customerId = existingCustomer.stripe_customer_id;
      logStep('Reusing existing Stripe customer from database', { customerId });
    } else {
      // Check if customer exists in Stripe by email (may have been created outside our flow)
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep('Found existing Stripe customer by email', { customerId });
      } else {
        // No existing customer - Stripe will create one during checkout
        // The webhook will upsert stripe_customers after checkout completes
        logStep('No existing customer, Stripe will create during checkout');
      }
    }

    // 5. Create checkout session with verified userId in metadata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      client_reference_id: userId, // Also store for easy lookup
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/`,
      metadata: {
        clerk_user_id: userId, // Critical: webhook uses this for user linkage
      },
    });

    logStep('Checkout session created', { 
      sessionId: session.id, 
      url: session.url,
      clerkUserId: userId,
      customerId: customerId || 'new'
    });

    return new Response(JSON.stringify({ url: session.url }), {
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