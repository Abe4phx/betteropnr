-- Update RLS policies for users table to use user_id claim
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

CREATE POLICY "Users can insert own record" ON public.users
FOR INSERT WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

CREATE POLICY "Users can read own record" ON public.users
FOR SELECT USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

CREATE POLICY "Users can update own record" ON public.users
FOR UPDATE USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Update RLS policies for user_profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

CREATE POLICY "Users can read own profile" ON public.user_profiles
FOR SELECT USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))
WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Update RLS policies for user_usage table
DROP POLICY IF EXISTS "Users can insert own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;

CREATE POLICY "Users can insert own usage" ON public.user_usage
FOR INSERT WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

CREATE POLICY "Users can update own usage" ON public.user_usage
FOR UPDATE USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

CREATE POLICY "Users can view own usage" ON public.user_usage
FOR SELECT USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));

-- Update stripe_customers policy
DROP POLICY IF EXISTS "Users can view own stripe data" ON public.stripe_customers;

CREATE POLICY "Users can view own stripe data" ON public.stripe_customers
FOR SELECT USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text));