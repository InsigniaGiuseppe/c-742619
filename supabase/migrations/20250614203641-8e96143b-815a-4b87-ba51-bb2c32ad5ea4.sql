
-- Phase 1: Fix critical foreign key constraints
-- The trading error occurs because user_portfolios and other tables reference auth.users instead of profiles

-- Fix user_portfolios table foreign key
ALTER TABLE public.user_portfolios
DROP CONSTRAINT IF EXISTS user_portfolios_user_id_fkey;

ALTER TABLE public.user_portfolios
ADD CONSTRAINT user_portfolios_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix user_watchlist table foreign key
ALTER TABLE public.user_watchlist
DROP CONSTRAINT IF EXISTS user_watchlist_user_id_fkey;

ALTER TABLE public.user_watchlist
ADD CONSTRAINT user_watchlist_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix external_wallets table foreign key
ALTER TABLE public.external_wallets
DROP CONSTRAINT IF EXISTS external_wallets_user_id_fkey;

ALTER TABLE public.external_wallets
ADD CONSTRAINT external_wallets_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix kyc_documents table foreign key
ALTER TABLE public.kyc_documents
DROP CONSTRAINT IF EXISTS kyc_documents_user_id_fkey;

ALTER TABLE public.kyc_documents
ADD CONSTRAINT kyc_documents_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix user_sessions table foreign key
ALTER TABLE public.user_sessions
DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;

ALTER TABLE public.user_sessions
ADD CONSTRAINT user_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix user_settings table foreign key
ALTER TABLE public.user_settings
DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

ALTER TABLE public.user_settings
ADD CONSTRAINT user_settings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add date_of_birth column to profiles table for enhanced KYC
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add postal_code column for complete address information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Add city column for complete address information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city TEXT;

-- Update RLS policies for external_wallets to use profiles
DROP POLICY IF EXISTS "Users can manage their own external wallets" ON public.external_wallets;
CREATE POLICY "Users can manage their own external wallets"
ON public.external_wallets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for kyc_documents to use profiles
DROP POLICY IF EXISTS "Users can manage their own KYC documents" ON public.kyc_documents;
CREATE POLICY "Users can manage their own KYC documents"
ON public.kyc_documents FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for user_sessions to use profiles
DROP POLICY IF EXISTS "Users can view and manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view and manage their own sessions"
ON public.user_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for user_settings to use profiles
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings"
ON public.user_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for user_portfolios to use profiles
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own portfolios" ON public.user_portfolios;
CREATE POLICY "Users can manage their own portfolios"
ON public.user_portfolios FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for user_watchlist to use profiles
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.user_watchlist;
CREATE POLICY "Users can manage their own watchlist"
ON public.user_watchlist FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create admin policies for KYC and wallet management
CREATE POLICY "Admins can view all KYC documents"
ON public.kyc_documents FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update KYC documents"
ON public.kyc_documents FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all external wallets"
ON public.external_wallets FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update external wallets"
ON public.external_wallets FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all user portfolios"
ON public.user_portfolios FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all trading orders"
ON public.trading_orders FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update trading orders"
ON public.trading_orders FOR UPDATE
USING (public.is_admin(auth.uid()));
