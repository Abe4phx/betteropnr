-- Fix protect_plan_fields() so trusted server-side service-role callers
-- (stripe-webhook, sync-existing-subscription, and future Apple subscription
-- sync) can actually change users.plan / users.plan_interval, while ordinary
-- authenticated and anonymous client requests continue to have those two
-- fields silently reverted.
--
-- Root cause: the existing trigger has no role-based exemption at all, so it
-- reverts plan/plan_interval changes made by every caller, including
-- service_role. Server-side UPDATEs currently return no error but never
-- persist the new plan.
--
-- auth.role() is a Supabase-platform-provided helper (already relied on by
-- this project's own RLS policies via the sibling auth.jwt() function, see
-- migration 20251229053350) that reads the role PostgREST assigned to the
-- current request from the JWT it verified for this connection. It is not a
-- client-supplied value: a client cannot set it, since clients only ever
-- reach this database through PostgREST or an Edge Function, never a raw SQL
-- session. It safely returns NULL (not an error) when no JWT/role context is
-- present, e.g. for a direct SQL Editor or psql admin session, so that case
-- falls through to the same protective behavior as an ordinary client rather
-- than being silently exempted.
CREATE OR REPLACE FUNCTION public.protect_plan_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trusted server-side callers authenticated as service_role (Edge
  -- Functions using SUPABASE_SERVICE_ROLE_KEY) are allowed to change plan
  -- and plan_interval; every other column already passes through NEW
  -- unmodified regardless of this branch.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Ordinary authenticated/anonymous requests, and any session with no
  -- JWT role context at all (direct SQL/admin access), keep plan and
  -- plan_interval pinned to their previous values.
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;

  IF NEW.plan_interval IS DISTINCT FROM OLD.plan_interval THEN
    NEW.plan_interval := OLD.plan_interval;
  END IF;

  RETURN NEW;
END;
$$;

-- The existing trigger `protect_user_plan_fields` already references
-- public.protect_plan_fields() by name and continues to use this replaced
-- definition automatically. No DROP/CREATE TRIGGER is needed or performed.
