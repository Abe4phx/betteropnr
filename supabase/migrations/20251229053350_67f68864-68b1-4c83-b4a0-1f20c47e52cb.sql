-- =====================================================
-- Update RLS policies to use auth.jwt() ->> 'sub' for Clerk JWT identity
-- Note: auth.uid() returns UUID, but Clerk user IDs are strings, so we use auth.jwt() ->> 'sub'
-- =====================================================

-- =====================================================
-- 1. STRIPE_CUSTOMERS TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own stripe data" ON public.stripe_customers;
DROP POLICY IF EXISTS "Deny user inserts on stripe_customers" ON public.stripe_customers;
DROP POLICY IF EXISTS "Deny user updates on stripe_customers" ON public.stripe_customers;
DROP POLICY IF EXISTS "Deny user deletes on stripe_customers" ON public.stripe_customers;

-- Ensure RLS is enabled
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only read their own stripe data
CREATE POLICY "Users can view own stripe data"
ON public.stripe_customers
FOR SELECT
TO authenticated
USING (user_id = (auth.jwt() ->> 'sub'));

-- INSERT: Deny all user inserts (only webhooks via service role)
CREATE POLICY "Deny user inserts on stripe_customers"
ON public.stripe_customers
FOR INSERT
TO authenticated
WITH CHECK (false);

-- UPDATE: Deny all user updates (only webhooks via service role)
CREATE POLICY "Deny user updates on stripe_customers"
ON public.stripe_customers
FOR UPDATE
TO authenticated
USING (false);

-- DELETE: Deny all user deletes
CREATE POLICY "Deny user deletes on stripe_customers"
ON public.stripe_customers
FOR DELETE
TO authenticated
USING (false);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can delete own record" ON public.users;

-- SELECT: Users can read their own record
CREATE POLICY "Users can read own record"
ON public.users
FOR SELECT
TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- INSERT: Users can insert their own record
CREATE POLICY "Users can insert own record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

-- UPDATE: Users can update their own record
CREATE POLICY "Users can update own record"
ON public.users
FOR UPDATE
TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

-- DELETE: Users can delete their own record
CREATE POLICY "Users can delete own record"
ON public.users
FOR DELETE
TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- =====================================================
-- 3. USER_PROFILES TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- SELECT: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- INSERT: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

-- DELETE: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'));

-- =====================================================
-- 4. USER_USAGE TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.user_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.user_usage;

-- SELECT: Users can view their own usage
CREATE POLICY "Users can view own usage"
ON public.user_usage
FOR SELECT
TO authenticated
USING (user_id = (auth.jwt() ->> 'sub'));

-- INSERT: Users can insert their own usage
CREATE POLICY "Users can insert own usage"
ON public.user_usage
FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- UPDATE: Users can update their own usage
CREATE POLICY "Users can update own usage"
ON public.user_usage
FOR UPDATE
TO authenticated
USING (user_id = (auth.jwt() ->> 'sub'));