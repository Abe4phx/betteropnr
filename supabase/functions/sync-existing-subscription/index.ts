import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[SYNC-SUBSCRIPTION] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify admin secret for security
    const { stripeCustomerId, adminSecret } = await req.json();
    
    const expectedAdminSecret = Deno.env.get("ADMIN_SECRET");
    if (!expectedAdminSecret || adminSecret !== expectedAdminSecret) {
      throw new Error("Unauthorized: Invalid admin secret");
    }
    
    if (!stripeCustomerId) {
      throw new Error("stripeCustomerId is required");
    }
    
    logStep("Request validated", { stripeCustomerId });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch customer from Stripe
    logStep("Fetching Stripe customer");
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (customer.deleted) {
      throw new Error("Customer has been deleted in Stripe");
    }
    
    const email = customer.email;
    if (!email) {
      throw new Error("Customer has no email address");
    }
    logStep("Customer found", { email });

    // Fetch active subscriptions
    logStep("Fetching subscriptions");
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found for this customer");
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price?.id;
    
    logStep("Subscription found", { 
      subscriptionId: subscription.id, 
      priceId,
      status: subscription.status 
    });

    // Map price ID to plan
    const priceIdToPlan: Record<string, { plan: string; interval: string }> = {
      "price_1SQHtY7GxpG0bh7WIeEYLjgD": { plan: "pro", interval: "month" },
      "price_1SQHtY7GxpG0bh7WYLYHBr6U": { plan: "pro", interval: "year" },
    };

    const planInfo = priceIdToPlan[priceId] || { plan: "pro", interval: "month" };
    logStep("Plan determined", planInfo);

    // Find user by email
    logStep("Looking up user by email");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_user_id, email, plan")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      throw new Error(`Error fetching user: ${userError.message}`);
    }

    if (!userData) {
      throw new Error(`No user found with email: ${email}`);
    }

    logStep("User found", { 
      clerkUserId: userData.clerk_user_id, 
      currentPlan: userData.plan 
    });

    // Upsert stripe_customers record
    logStep("Upserting stripe_customers record");
    const { error: stripeCustomerError } = await supabase
      .from("stripe_customers")
      .upsert({
        user_id: userData.clerk_user_id,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (stripeCustomerError) {
      throw new Error(`Error upserting stripe_customers: ${stripeCustomerError.message}`);
    }
    logStep("stripe_customers record upserted");

    // Update user plan using service role (bypasses RLS and trigger)
    logStep("Updating user plan");
    const { error: updateError } = await supabase
      .from("users")
      .update({
        plan: planInfo.plan,
        plan_interval: planInfo.interval,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", userData.clerk_user_id);

    if (updateError) {
      throw new Error(`Error updating user plan: ${updateError.message}`);
    }
    logStep("User plan updated successfully");

    // Verify the updates
    const { data: verifyStripe } = await supabase
      .from("stripe_customers")
      .select("*")
      .eq("user_id", userData.clerk_user_id)
      .single();

    const { data: verifyUser } = await supabase
      .from("users")
      .select("plan, plan_interval")
      .eq("clerk_user_id", userData.clerk_user_id)
      .single();

    logStep("Sync completed successfully", {
      stripeCustomers: verifyStripe,
      userPlan: verifyUser,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription synced successfully",
        data: {
          clerkUserId: userData.clerk_user_id,
          email,
          plan: planInfo.plan,
          planInterval: planInfo.interval,
          stripeCustomerId,
          subscriptionId: subscription.id,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
