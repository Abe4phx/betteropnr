-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  countries_supported TEXT[] DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  affiliate_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Public read access (affiliates are public data)
CREATE POLICY "Affiliates are publicly readable"
ON public.affiliates
FOR SELECT
USING (true);

-- Create index for efficient querying
CREATE INDEX idx_affiliates_category_active ON public.affiliates(category, is_active);
CREATE INDEX idx_affiliates_priority ON public.affiliates(priority DESC);