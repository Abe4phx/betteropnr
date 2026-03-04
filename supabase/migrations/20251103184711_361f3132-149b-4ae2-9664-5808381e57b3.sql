-- Create user_usage table to track daily usage
CREATE TABLE public.user_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  openers_generated integer NOT NULL DEFAULT 0,
  favorites_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
ON public.user_usage
FOR SELECT
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Users can insert their own usage
CREATE POLICY "Users can insert own usage"
ON public.user_usage
FOR INSERT
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Users can update their own usage
CREATE POLICY "Users can update own usage"
ON public.user_usage
FOR UPDATE
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Create stripe_customers table
CREATE TABLE public.stripe_customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL UNIQUE,
  stripe_subscription_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on stripe_customers
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Users can view their own Stripe data
CREATE POLICY "Users can view own stripe data"
ON public.stripe_customers
FOR SELECT
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Add plan_interval column to users table
ALTER TABLE public.users ADD COLUMN plan_interval text;

-- Create trigger for user_usage updated_at
CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON public.user_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();

-- Create trigger for stripe_customers updated_at
CREATE TRIGGER update_stripe_customers_updated_at
BEFORE UPDATE ON public.stripe_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_users_updated_at();