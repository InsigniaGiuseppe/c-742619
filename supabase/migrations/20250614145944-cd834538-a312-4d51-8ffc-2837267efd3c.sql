
-- Create ENUM types for statuses and types to ensure data consistency
CREATE TYPE public.wallet_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.kyc_document_type AS ENUM ('id_card', 'passport', 'drivers_license', 'proof_of_address');
CREATE TYPE public.kyc_status AS ENUM ('not_started', 'pending', 'verified', 'rejected');

-- 1. Create a table to store user-submitted external wallets for verification
CREATE TABLE public.external_wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_symbol TEXT NOT NULL,
    network TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    wallet_label TEXT,
    screenshot_url TEXT,
    status public.wallet_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.external_wallets IS 'Stores user-submitted external wallets for withdrawal/deposit whitelisting.';

-- Enable Row Level Security for external_wallets
ALTER TABLE public.external_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own external wallets"
ON public.external_wallets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Create a table to track user login sessions for security
CREATE TABLE public.user_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT,
    os_browser TEXT,
    ip_address INET,
    last_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.user_sessions IS 'Tracks user login sessions for security monitoring.';

-- Enable Row Level Security for user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their own sessions"
ON public.user_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Create a table for user-specific notification settings
CREATE TABLE public.user_settings (
    user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_on_login BOOLEAN NOT NULL DEFAULT true,
    email_on_withdrawal BOOLEAN NOT NULL DEFAULT true,
    sms_on_withdrawal BOOLEAN NOT NULL DEFAULT false,
    price_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.user_settings IS 'Stores user notification and communication preferences.';

-- Enable Row Level Security for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings"
ON public.user_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create a table to manage KYC documents
CREATE TABLE public.kyc_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type public.kyc_document_type NOT NULL,
    document_url TEXT NOT NULL,
    status public.kyc_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.kyc_documents IS 'Stores documents for Know Your Customer (KYC) verification.';

-- Enable Row Level Security for kyc_documents
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own KYC documents"
ON public.kyc_documents FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Add new columns to the existing profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS bank_details_iban TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'Standard',
ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_ip INET,
ADD COLUMN IF NOT EXISTS kyc_status public.kyc_status NOT NULL DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS demo_balance_usd NUMERIC NOT NULL DEFAULT 10000;

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('wallet-screenshots', 'wallet-screenshots', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg']),
  ('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Policies for wallet-screenshots bucket
DROP POLICY IF EXISTS "Wallet screenshots select" ON storage.objects;
CREATE POLICY "Wallet screenshots select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'wallet-screenshots' AND auth.uid() = (storage.foldername(name))[1]::uuid );

DROP POLICY IF EXISTS "Wallet screenshots insert" ON storage.objects;
CREATE POLICY "Wallet screenshots insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'wallet-screenshots' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Policies for kyc-documents bucket (private)
DROP POLICY IF EXISTS "KYC documents select" ON storage.objects;
CREATE POLICY "KYC documents select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'kyc-documents' AND auth.uid() = (storage.foldername(name))[1]::uuid );

DROP POLICY IF EXISTS "KYC documents insert" ON storage.objects;
CREATE POLICY "KYC documents insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'kyc-documents' AND auth.uid() = (storage.foldername(name))[1]::uuid );

