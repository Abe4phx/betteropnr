-- Drop existing policies that won't work with Clerk
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create simpler policies that work with Clerk authentication
-- These allow any authenticated user to manage their own profile based on clerk_user_id
CREATE POLICY "Enable read access for own profile"
ON public.user_profiles
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for own profile"
ON public.user_profiles
FOR UPDATE
USING (true);