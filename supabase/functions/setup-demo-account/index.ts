import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin secret for authentication
    const adminSecret = Deno.env.get('ADMIN_SECRET');
    const providedSecret = req.headers.get('x-admin-secret');
    
    if (!adminSecret || providedSecret !== adminSecret) {
      console.log('Unauthorized access attempt to setup-demo-account');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, email } = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'userId and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create or update user record
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        clerk_user_id: userId,
        email: email,
        plan: 'free',
        has_seen_welcome: true, // Skip welcome flow for reviewer
        username: 'Apple Reviewer',
      }, { onConflict: 'clerk_user_id' });

    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }

    // Create sample profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        clerk_user_id: userId,
        profile_text: "I'm a 28-year-old software engineer who loves hiking, cooking, and discovering new coffee shops. I enjoy deep conversations about technology, travel, and life goals. Looking for someone who shares my sense of humor and curiosity about the world.",
      }, { onConflict: 'clerk_user_id' });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }

    // Create sample usage data
    const today = new Date().toISOString().split('T')[0];
    const { error: usageError } = await supabase
      .from('user_usage')
      .upsert({
        user_id: userId,
        date: today,
        openers_generated: 5,
        favorites_count: 2,
      }, { onConflict: 'user_id,date' });

    if (usageError) {
      console.error('Error creating usage data:', usageError);
      // Non-critical, continue
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo account data created successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error setting up demo account:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
