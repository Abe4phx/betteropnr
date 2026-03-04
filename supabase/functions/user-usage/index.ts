import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyClerkJWT, createAuthErrorResponse } from '../_shared/clerkAuth.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify JWT and extract user ID
    const authResult = await verifyClerkJWT(req);
    
    if (!authResult.success) {
      console.error('Auth failed:', authResult.error);
      return createAuthErrorResponse(authResult.error, authResult.status, corsHeaders);
    }

    const userId = authResult.userId;
    console.log('Authenticated user for usage:', userId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    // ============ GET TODAY'S USAGE ============
    if (action === "get") {
      const { data, error } = await supabase
        .from("user_usage")
        .select("openers_generated, favorites_count")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching usage:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch usage" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          openers_generated: data?.openers_generated || 0,
          favorites_count: data?.favorites_count || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ INCREMENT OPENERS ============
    if (action === "incrementOpeners") {
      const { data: existing } = await supabase
        .from("user_usage")
        .select("id, openers_generated")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_usage")
          .update({ openers_generated: existing.openers_generated + 1 })
          .eq("id", existing.id);

        if (error) {
          console.error("Error incrementing openers:", error);
          return new Response(
            JSON.stringify({ error: "Failed to increment openers" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const { error } = await supabase
          .from("user_usage")
          .insert({
            user_id: userId,
            date: today,
            openers_generated: 1,
            favorites_count: 0,
          });

        if (error) {
          console.error("Error creating usage record:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create usage record" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ INCREMENT FAVORITES ============
    if (action === "incrementFavorites") {
      const { data: existing } = await supabase
        .from("user_usage")
        .select("id, favorites_count")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_usage")
          .update({ favorites_count: existing.favorites_count + 1 })
          .eq("id", existing.id);

        if (error) {
          console.error("Error incrementing favorites:", error);
          return new Response(
            JSON.stringify({ error: "Failed to increment favorites" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const { error } = await supabase
          .from("user_usage")
          .insert({
            user_id: userId,
            date: today,
            openers_generated: 0,
            favorites_count: 1,
          });

        if (error) {
          console.error("Error creating usage record:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create usage record" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ GET STATS (Historical data for Statistics page) ============
    if (action === "getStats") {
      // Fetch last 30 days of usage data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: historicalData, error: histError } = await supabase
        .from("user_usage")
        .select("date, openers_generated, favorites_count")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (histError) {
        console.error("Error fetching historical data:", histError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch historical data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch all-time totals
      const { data: allTimeData, error: allTimeError } = await supabase
        .from("user_usage")
        .select("openers_generated, favorites_count")
        .eq("user_id", userId);

      if (allTimeError) {
        console.error("Error fetching all-time data:", allTimeError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch all-time data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const totals = (allTimeData || []).reduce(
        (acc, curr) => ({
          totalOpeners: acc.totalOpeners + curr.openers_generated,
          totalFavorites: acc.totalFavorites + curr.favorites_count,
        }),
        { totalOpeners: 0, totalFavorites: 0 }
      );

      return new Response(
        JSON.stringify({
          historicalData: historicalData || [],
          totalStats: totals,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
