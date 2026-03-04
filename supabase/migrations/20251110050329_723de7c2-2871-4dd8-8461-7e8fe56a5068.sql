-- Add explicit DENY policies for stripe_customers table
-- Only service role (backend functions) can modify this table

-- Prevent users from inserting stripe customer records
CREATE POLICY "Deny user inserts on stripe_customers"
ON public.stripe_customers
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Prevent users from updating stripe customer records
CREATE POLICY "Deny user updates on stripe_customers"
ON public.stripe_customers
FOR UPDATE
TO authenticated
USING (false);

-- Prevent users from deleting stripe customer records
CREATE POLICY "Deny user deletes on stripe_customers"
ON public.stripe_customers
FOR DELETE
TO authenticated
USING (false);

-- Add comment explaining the security model
COMMENT ON TABLE public.stripe_customers IS 'Payment data table. Only service role (backend functions) can modify. Users can only view their own records via SELECT policy.';