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

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    // Verify webhook signature if secret is provided
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep('Webhook signature verified');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logStep('Webhook signature verification failed', { error: errorMessage });
        return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      event = JSON.parse(body);
      logStep('Processing webhook without signature verification (development mode)');
    }

    logStep('Event type', { type: event.type });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep('Checkout session completed', { sessionId: session.id });

        const clerkUserId = session.metadata?.clerk_user_id;
        if (!clerkUserId) {
          logStep('No clerk_user_id in metadata');
          break;
        }

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get subscription details to determine plan
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const planInfo = PRICE_PLAN_MAP[priceId] || { plan: 'pro', interval: 'monthly' };

        logStep('Plan determined', planInfo);

        // Store or update customer in stripe_customers table
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
          logStep('Error storing customer', { error: customerError });
        } else {
          logStep('Customer stored successfully');
        }

        // Update user plan
        const { error: planError } = await supabaseClient
          .from('users')
          .update({ 
            plan: planInfo.plan,
            plan_interval: planInfo.interval,
          })
          .eq('clerk_user_id', clerkUserId);

        if (planError) {
          logStep('Error updating user plan', { error: planError });
        } else {
          logStep('User plan updated successfully', planInfo);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep('Subscription updated', { subscriptionId: subscription.id });

        const priceId = subscription.items.data[0].price.id;
        const planInfo = PRICE_PLAN_MAP[priceId] || { plan: 'pro', interval: 'monthly' };

        // Find user by customer ID
        const { data: customer } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (customer) {
          await supabaseClient
            .from('users')
            .update({ 
              plan: subscription.status === 'active' ? planInfo.plan : 'free',
              plan_interval: subscription.status === 'active' ? planInfo.interval : null,
            })
            .eq('clerk_user_id', customer.user_id);

          logStep('User plan updated from subscription change');
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep('Subscription deleted', { subscriptionId: subscription.id });

        // Find user by customer ID
        const { data: customer } = await supabaseClient
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (customer) {
          // Downgrade to free plan
          await supabaseClient
            .from('users')
            .update({ plan: 'free', plan_interval: null })
            .eq('clerk_user_id', customer.user_id);

          logStep('User downgraded to free plan');
        }

        break;
      }

      default:
        logStep('Unhandled event type', { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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
