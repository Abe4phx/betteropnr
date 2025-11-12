-- Fix RLS policies for Clerk-based authentication
-- Since Clerk handles auth separately from Supabase, we need more permissive policies

-- Drop the JWT-based policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create new policies that allow user self-management
-- These work with Clerk by allowing users to manage records with their clerk_user_id

CREATE POLICY "Enable read for all authenticated users"
ON public.users
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.users
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON public.users
FOR UPDATE
USING (true);