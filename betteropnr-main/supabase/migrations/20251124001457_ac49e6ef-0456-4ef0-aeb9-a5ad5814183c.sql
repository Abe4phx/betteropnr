-- Fix search_path security issue
DROP FUNCTION IF EXISTS public.protect_plan_fields() CASCADE;

CREATE OR REPLACE FUNCTION public.protect_plan_fields()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER protect_user_plan_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_plan_fields();