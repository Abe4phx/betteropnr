
-- GUEST_LIMITS: Server-side guest daily usage tracking
CREATE TABLE public.guest_generation_usage (
  guest_key TEXT NOT NULL,
  date_utc TEXT NOT NULL,
  runs_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (guest_key, date_utc)
);

-- No RLS needed: this table is only accessed via service_role in edge functions
-- But enable RLS and deny all client access for safety
ALTER TABLE public.guest_generation_usage ENABLE ROW LEVEL SECURITY;

-- Deny all client access (service_role bypasses RLS)
CREATE POLICY "Deny all client access on guest_generation_usage"
  ON public.guest_generation_usage
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Index for cleanup queries
CREATE INDEX idx_guest_usage_date ON public.guest_generation_usage (date_utc);
