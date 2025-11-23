-- Add has_seen_welcome field to users table to track first-time tutorial completion
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_welcome BOOLEAN DEFAULT false;