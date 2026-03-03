import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, category, country } = await req.json();

    // ============ GET AFFILIATE FOR CATEGORY ============
    if (action === "getForCategory") {
      if (!category) {
        return new Response(
          JSON.stringify({ error: "Category is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // First, try to get the highest priority affiliate for this category
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching affiliate:", error);
        return new Response(
          JSON.stringify({ affiliate: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ affiliate: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const affiliate = data[0];

      // If country is specified, check if this affiliate supports it
      if (country) {
        const countriesSupported = affiliate.countries_supported || [];
        
        // If countries_supported is empty, it's available everywhere
        if (countriesSupported.length > 0 && !countriesSupported.includes(country)) {
          // This affiliate doesn't support the user's country, try to find another
          const { data: allAffiliates } = await supabase
            .from("affiliates")
            .select("*")
            .eq("category", category)
            .eq("is_active", true)
            .order("priority", { ascending: false });

          if (!allAffiliates) {
            return new Response(
              JSON.stringify({ affiliate: null }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Find first affiliate that supports the country or is globally available
          const matchingAffiliate = allAffiliates.find(a => {
            const countries = a.countries_supported || [];
            return countries.length === 0 || countries.includes(country);
          });

          return new Response(
            JSON.stringify({ affiliate: matchingAffiliate || null }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ affiliate }),
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
