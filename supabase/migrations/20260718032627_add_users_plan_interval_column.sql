-- Add the missing plan_interval column to public.users.
--
-- protect_plan_fields() (see migration 20260718003504) already references
-- NEW.plan_interval, and stripe-webhook already writes to it, but the live
-- production table never had this column added. Nullable, no default, no
-- backfill: existing rows simply have no interval recorded until a plan
-- update (Stripe or a future Apple sync) sets one.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_interval text;
