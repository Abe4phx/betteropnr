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
    const email = authResult.email;
    console.log('Authenticated user:', userId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, profileText, username } = await req.json();

    // ============ SYNC ACTION ============
    // Syncs user to database - checks if exists, creates if needed, updates if exists
    if (action === "sync") {
      console.log('Sync action for user:', userId);
      
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking for existing user:", fetchError);
        return new Response(
          JSON.stringify({ success: true, isNew: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!existingUser) {
        // Create new user
        console.log('Creating new user in database');
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            clerk_user_id: userId,
            email: email || `${userId}@placeholder.com`,
            username: username || "User",
            plan: "free",
          });

        if (insertError) {
          console.error("Error creating user:", insertError);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to create user" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, isNew: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Update existing user in background (non-blocking approach via response)
        console.log('Existing user found, updating...');
        supabase
          .from("users")
          .update({
            email: email || existingUser.email,
            username: username || existingUser.username,
          })
          .eq("clerk_user_id", userId)
          .then(({ error }) => {
            if (error) console.error("Background user update failed:", error);
          });

        return new Response(
          JSON.stringify({ success: true, isNew: false, plan: existingUser.plan }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ============ GET PLAN ACTION ============
    if (action === "getPlan") {
      const { data, error } = await supabase
        .from("users")
        .select("plan")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching plan:", error);
        return new Response(
          JSON.stringify({ plan: "free" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ plan: data?.plan || "free" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ CHECK NEW USER ACTION ============
    if (action === "checkNewUser") {
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

      const isNewUser = !data || !data.has_seen_welcome;
      console.log(`Check new user for ${userId}: isNewUser=${isNewUser}`);
      
      return new Response(
        JSON.stringify({ isNewUser }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ GET PROFILE ACTION ============
    if (action === "get") {
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

    // ============ SAVE PROFILE ACTION ============
    if (action === "save") {
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

    // ============ MARK WELCOME SEEN ACTION ============
    if (action === "markWelcomeSeen") {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (existingUser) {
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
