
-- Phase 3: Vaults Feature Database Setup

-- 1. Create ENUM type for vault status
CREATE TYPE public.vault_status AS ENUM (
    'active',
    'completed',
    'withdrawn'
);

-- 2. Create vault_configurations table
CREATE TABLE public.vault_configurations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cryptocurrency_id uuid NOT NULL REFERENCES public.cryptocurrencies(id),
    duration_days integer NOT NULL,
    apy numeric NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT vault_configurations_unique_crypto_duration UNIQUE (cryptocurrency_id, duration_days)
);
COMMENT ON TABLE public.vault_configurations IS 'Stores configuration for available vaults, such as APY for a specific crypto and duration.';
COMMENT ON COLUMN public.vault_configurations.duration_days IS 'Lock-in period in days (e.g., 30, 60, 90).';
COMMENT ON COLUMN public.vault_configurations.apy IS 'Annual Percentage Yield for this vault configuration.';

-- 3. Create user_vaults table
CREATE TABLE public.user_vaults (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    vault_config_id uuid NOT NULL REFERENCES public.vault_configurations(id),
    amount_vaulted numeric NOT NULL,
    accrued_yield numeric NOT NULL DEFAULT 0,
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    ends_at timestamp with time zone NOT NULL,
    status public.vault_status NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.user_vaults IS 'Tracks user deposits into vaults.';
COMMENT ON COLUMN public.user_vaults.ends_at IS 'Timestamp when the vault lock-in period ends.';

-- 4. Create vault_payouts table
CREATE TABLE public.vault_payouts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    user_vault_id uuid NOT NULL REFERENCES public.user_vaults(id) ON DELETE CASCADE,
    payout_date date NOT NULL DEFAULT CURRENT_DATE,
    amount numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.vault_payouts IS 'Logs daily yield payouts for each user vault.';


-- 5. Set up RLS policies
-- vault_configurations: Allow authenticated users to read.
ALTER TABLE public.vault_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to vault configurations" ON public.vault_configurations FOR SELECT TO authenticated USING (true);

-- user_vaults: Users can manage their own vaults.
ALTER TABLE public.user_vaults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vaults" ON public.user_vaults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own vaults" ON public.user_vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vaults" ON public.user_vaults FOR UPDATE USING (auth.uid() = user_id);

-- vault_payouts: Users can view their own payouts.
ALTER TABLE public.vault_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vault payouts" ON public.vault_payouts FOR SELECT USING (auth.uid() = user_id);

-- 6. Add triggers to automatically update `updated_at` timestamps.
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.vault_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.user_vaults
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

