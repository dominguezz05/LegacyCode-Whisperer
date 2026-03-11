-- Phase 5-A: per-user audit history
-- Run this in Supabase Dashboard → SQL Editor → New query

-- 1. Add nullable user_id column (UUID references auth.users)
ALTER TABLE audits
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index for fast per-user history queries
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits (user_id, created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- 4. Policy: users can only read their own audits
CREATE POLICY "Users can read own audits"
    ON audits FOR SELECT
    USING (auth.uid() = user_id);

-- 5. Policy: authenticated users can insert their own audits
CREATE POLICY "Users can insert own audits"
    ON audits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. Service-role key bypasses RLS (used by the backend with service key)
--    No additional policy needed — service_role always bypasses RLS in Supabase.
