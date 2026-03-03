import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Price ID to plan mapping - PRODUCTION
const PRICE_PLAN_MAP: Record<string, { plan: string; interval: string }> = {
  'price_1SQiGI7GxpG0bh7WRavu0K4M': { plan: 'pro', interval: 'monthly' },  // Pro Monthly
  'price_1SQiGb7GxpG0bh7WVHyvR74d': { plan: 'pro', interval: 'yearly' },   // Pro Yearly
  'price_1SQiGr7GxpG0bh7Woot7ZPqs': { plan: 'creator', interval: 'monthly' }, // Creator Monthly
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Webhook received');

    // 1. Validate required secrets
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) {
      logStep('ERROR: STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. SECURITY: Require webhook signature verification
    if (!webhookSecret) {
      logStep('ERROR: STRIPE_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook verification not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      logStep('ERROR: Missing stripe-signature header');
      return new Response(
        JSON.stringify({ error: 'Missing webhook signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
    const body = await req.text();

    // 3. Verify webhook signature using raw body and Stripe constructEvent
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep('Webhook signature verified successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logStep('ERROR: Webhook signature verification failed', { error: errorMessage });
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Processing event', { type: event.type, id: event.id });

    // 4. Use Supabase service role key for all DB writes (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep('ERROR: Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Database service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // 5. Handle webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep('checkout.session.completed', { sessionId: session.id });

        // SECURITY: Get clerk_user_id ONLY from trusted session metadata
        // This was set by our create-checkout function with verified user identity
        const clerkUserId = session.metadata?.clerk_user_id;
        if (!clerkUserId) {
          logStep('WARNING: No clerk_user_id in session metadata, skipping');
          break;
        }

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!customerId || !subscriptionId) {
          logStep('WARNING: Missing customer or subscription ID', { customerId, subscriptionId });
          break;
        }

        // Get subscription details to determine plan
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const planInfo = PRICE_PLAN_MAP[priceId] || { plan: 'pro', interval: 'monthly' };

        logStep('Plan determined from subscription', { priceId, ...planInfo });

        // UPSERT stripe_customers on user_id (clerk_user_id)
        // user_id comes from trusted metadata, not user-controlled input
        const { error: customerError } = await supabaseClient
          .from('stripe_customers')
          .upsert({
            user_id: clerkUserId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          }, {
            onConflict: 'user_id',
          });

        if (customerError) {
          logStep('ERROR: Failed to upsert stripe_customers', { error: customerError.message });
        } else {
          logStep('stripe_customers upserted successfully', { userId: clerkUserId, customerId });
        }

        // Update user plan in users table
        const { error: planError } = await supabaseClient
          .from('users')
          .update({ 
            plan: planInfo.plan,
            plan_interval: planInfo.interval,
          })
          .eq('clerk_user_id', clerkUserId);

        if (planError) {
          logStep('ERROR: Failed to update user plan', { error: planError.message });
        } else {
          logStep('User plan updated successfully', { userId: clerkUserId, ...planInfo });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep('customer.subscription.updated', { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });

        const priceId = subscription.items.data[0]?.price?.id;
        const planInfo = PRICE_PLAN_MAP[priceId] || { plan: 'pro', interval: 'monthly' };

        // Look up user by stripe_customer_id (trusted from Stripe)
        const { data: customer, error: lookupError } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .maybeSingle();

        if (lookupError) {
          logStep('ERROR: Failed to lookup customer', { error: lookupError.message });
          break;
        }

        if (!customer) {
          logStep('WARNING: No stripe_customers record found for customer', { 
            customerId: subscription.customer 
          });
          break;
        }

        // Update user plan based on subscription status
        const isActive = subscription.status === 'active';
        const { error: updateError } = await supabaseClient
          .from('users')
          .update({ 
            plan: isActive ? planInfo.plan : 'free',
            plan_interval: isActive ? planInfo.interval : null,
          })
          .eq('clerk_user_id', customer.user_id);

        if (updateError) {
          logStep('ERROR: Failed to update user plan', { error: updateError.message });
        } else {
          logStep('User plan updated from subscription change', { 
            userId: customer.user_id, 
            status: subscription.status,
            plan: isActive ? planInfo.plan : 'free'
          });
        }

        // Also update subscription ID in stripe_customers
        await supabaseClient
          .from('stripe_customers')
          .update({ stripe_subscription_id: subscription.id })
          .eq('stripe_customer_id', subscription.customer as string);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep('customer.subscription.deleted', { subscriptionId: subscription.id });

        // Look up user by stripe_customer_id
        const { data: customer, error: lookupError } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .maybeSingle();

        if (lookupError) {
          logStep('ERROR: Failed to lookup customer', { error: lookupError.message });
          break;
        }

        if (!customer) {
          logStep('WARNING: No stripe_customers record found', { 
            customerId: subscription.customer 
          });
          break;
        }

        // Downgrade to free plan
        const { error: updateError } = await supabaseClient
          .from('users')
          .update({ plan: 'free', plan_interval: null })
          .eq('clerk_user_id', customer.user_id);

        if (updateError) {
          logStep('ERROR: Failed to downgrade user', { error: updateError.message });
        } else {
          logStep('User downgraded to free plan', { userId: customer.user_id });
        }

        // Clear subscription ID in stripe_customers (keep customer record)
        await supabaseClient
          .from('stripe_customers')
          .update({ stripe_subscription_id: null })
          .eq('stripe_customer_id', subscription.customer as string);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep('invoice.payment_failed', { 
          invoiceId: invoice.id, 
          customerId: invoice.customer 
        });
        // Could implement email notification or grace period logic here
        break;
      }

      default:
        logStep('Unhandled event type (acknowledged)', { type: event.type });
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('UNHANDLED ERROR', { message: errorMessage });
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
