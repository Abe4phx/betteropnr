import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    // Verify JWT and extract user ID
    const authResult = await verifyClerkJWT(req);
    
    if ('error' in authResult) {
      logStep('Auth failed', { error: authResult.error });
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    const userId = authResult.userId;
    logStep('User authenticated', { userId });

    const { priceId, userEmail } = await req.json();
    if (!priceId) throw new Error('Price ID is required');
    
    // Use email from JWT if available, otherwise from request body
    const email = authResult.email || userEmail;
    if (!email) throw new Error('User email is required');
    
    logStep('Request data received', { priceId, email, userId });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep('Existing customer found', { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: email,
        metadata: { clerk_user_id: userId },
      });
      customerId = customer.id;
      logStep('New customer created', { customerId });
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
        clerk_user_id: userId,
      },
    });

    logStep('Checkout session created', { sessionId: session.id, url: session.url });

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
