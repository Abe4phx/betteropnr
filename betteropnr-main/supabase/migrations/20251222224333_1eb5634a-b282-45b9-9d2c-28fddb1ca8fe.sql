-- Add RESTRICTIVE policy to prevent anonymous SELECT access on users table
-- This ensures that only requests with a valid Clerk JWT can read user data
CREATE POLICY "Deny anonymous reads on users" 
ON public.users 
AS RESTRICTIVE
FOR SELECT 
USING (
  -- Require a valid Clerk user_id in the JWT claims
  (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id') IS NOT NULL
);

-- Add RESTRICTIVE policy to prevent anonymous SELECT access on stripe_customers table
CREATE POLICY "Deny anonymous reads on stripe_customers" 
ON public.stripe_customers 
AS RESTRICTIVE
FOR SELECT 
USING (
  -- Require a valid Clerk user_id in the JWT claims
  (current_setting('request.jwt.claims'::text, true)::json ->> 'user_id') IS NOT NULL
);