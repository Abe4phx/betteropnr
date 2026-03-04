-- Fix critical RLS security issues
-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.user_profiles;

-- Create secure RLS policies for users table
-- Users can only read their own record
CREATE POLICY "Users can read own record"
  ON public.users
  FOR SELECT
  USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Users can only insert their own record (via Clerk sync)
CREATE POLICY "Users can insert own record"
  ON public.users
  FOR INSERT
  WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Users can update their own record (email, username, has_seen_welcome only)
-- Plan fields are protected by being excluded from updates
CREATE POLICY "Users can update own record"
  ON public.users
  FOR UPDATE
  USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))
  WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Create secure RLS policies for user_profiles table
-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))
  WITH CHECK (clerk_user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Add trigger to prevent users from modifying plan fields
CREATE OR REPLACE FUNCTION public.protect_plan_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If plan or plan_interval changed, revert to old values
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  IF NEW.plan_interval IS DISTINCT FROM OLD.plan_interval THEN
    NEW.plan_interval := OLD.plan_interval;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_user_plan_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_plan_fields();