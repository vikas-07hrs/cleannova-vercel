-- ============================================================
-- Cleannova – Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- ============================================================

-- Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  service       TEXT NOT NULL CHECK (service IN ('dry','home','maint','elec','plumb','deco')),
  message       TEXT,
  lang          TEXT DEFAULT 'en' CHECK (lang IN ('en','nl')),
  status        TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','closed','spam')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster listing
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes (status);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON public.quotes (email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotes_updated_at ON public.quotes;
CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (for the public quote form)
-- Uses the anon key – only insert is permitted from client if you ever call Supabase directly.
CREATE POLICY "Allow public insert on quotes"
  ON public.quotes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role (backend) can SELECT / UPDATE / DELETE
-- When using the service_role key in the backend, RLS is bypassed.
-- This policy is a safety net if you ever expose the anon key for reads.
CREATE POLICY "Service role full access"
  ON public.quotes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: allow authenticated admins to read (if you add Supabase Auth later)
-- CREATE POLICY "Admins can read quotes"
--   ON public.quotes FOR SELECT
--   TO authenticated
--   USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- Done. Your table is ready.
-- ============================================================
