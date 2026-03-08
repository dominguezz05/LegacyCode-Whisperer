-- Phase 2: Audit history persistence
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS audits (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    language        TEXT        NOT NULL,
    code_snippet    TEXT        NOT NULL,
    maintainability_score   INTEGER NOT NULL CHECK (maintainability_score BETWEEN 0 AND 100),
    complexity_report       JSONB   NOT NULL DEFAULT '{}',
    security_risks          JSONB   NOT NULL DEFAULT '[]',
    refactoring_suggestions JSONB   NOT NULL DEFAULT '[]',
    plain_english_summary   TEXT    NOT NULL
);

-- Index for chronological history queries
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits (created_at DESC);

-- Optional: enable Row Level Security (recommended for production)
-- ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
