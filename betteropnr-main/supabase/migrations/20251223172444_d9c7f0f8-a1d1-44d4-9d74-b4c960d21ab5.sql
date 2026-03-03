-- Drop the ineffective RESTRICTIVE policies
DROP POLICY IF EXISTS "Deny anonymous reads on users" ON public.users;
DROP POLICY IF EXISTS "Deny anonymous reads on stripe_customers" ON public.stripe_customers;

-- Update user_profiles: Add policy to deny anonymous reads
-- First, check if there's already a PERMISSIVE select policy and update it
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile" 
ON public.user_profiles 
AS PERMISSIVE
FOR SELECT 
USING (
  clerk_user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id')
);

-- Update user_usage: Add policy to deny anonymous reads  
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
CREATE POLICY "Users can view own usage" 
ON public.user_usage 
AS PERMISSIVE
FOR SELECT 
USING (
  user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id')
);

-- Update users table: Recreate as PERMISSIVE (already has the right logic)
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
CREATE POLICY "Users can read own record" 
ON public.users 
AS PERMISSIVE
FOR SELECT 
USING (
  clerk_user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id')
);

-- Update stripe_customers: Recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own stripe data" ON public.stripe_customers;
CREATE POLICY "Users can view own stripe data" 
ON public.stripe_customers 
AS PERMISSIVE
FOR SELECT 
USING (
  user_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id')
);