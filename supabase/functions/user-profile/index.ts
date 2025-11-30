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
    
    const { action, userId, profileText, email, username } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "checkNewUser") {
      // Check if user has seen welcome - bypasses RLS
      const { data, error } = await supabase
        .from("users")
        .select("has_seen_welcome")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking new user:", error);
        return new Response(
          JSON.stringify({ isNewUser: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // User is "new" if record doesn't exist OR hasn't seen welcome
      const isNewUser = !data || !data.has_seen_welcome;
      console.log(`Check new user for ${userId}: isNewUser=${isNewUser}, data=`, data);
      
      return new Response(
        JSON.stringify({ isNewUser }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get") {
      // Get profile
      const { data, error } = await supabase
        .from("user_profiles")
        .select("profile_text")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ profileText: data?.profile_text || "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "save") {
      // Save profile using upsert
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            clerk_user_id: userId,
            profile_text: profileText || "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "clerk_user_id" }
        );

      if (error) {
        console.error("Error saving profile:", error);
        return new Response(
          JSON.stringify({ error: "Failed to save profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "markWelcomeSeen") {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (existingUser) {
        // User exists, just update
        const { error } = await supabase
          .from("users")
          .update({ has_seen_welcome: true })
          .eq("clerk_user_id", userId);

        if (error) {
          console.error("Error marking welcome seen:", error);
          return new Response(
            JSON.stringify({ error: "Failed to mark welcome seen" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        // User doesn't exist, create with welcome marked as seen
        const { error } = await supabase
          .from("users")
          .insert({
            clerk_user_id: userId,
            email: email || `${userId}@placeholder.com`,
            username: username || "User",
            has_seen_welcome: true,
            plan: "free",
          });

        if (error) {
          console.error("Error creating user with welcome seen:", error);
          return new Response(
            JSON.stringify({ error: "Failed to create user" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
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
