
-- Create the transaction_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM (
            'buy',
            'sell', 
            'deposit',
            'withdrawal',
            'lending_interest',
            'lending_start',
            'lending_cancelled',
            'vault_deposit',
            'vault_withdrawal'
        );
    END IF;
END $$;

-- Insert vault configurations for BTC, ETH, SOL, and USDT
INSERT INTO public.vault_configurations (cryptocurrency_id, duration_days, apy, is_active)
SELECT 
    c.id,
    30,
    CASE 
        WHEN c.symbol IN ('BTC', 'ETH', 'USDT', 'SOL') THEN 0.08
        ELSE 0.05
    END,
    true
FROM public.cryptocurrencies c
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'SOL')
ON CONFLICT (cryptocurrency_id, duration_days) DO NOTHING;

INSERT INTO public.vault_configurations (cryptocurrency_id, duration_days, apy, is_active)
SELECT 
    c.id,
    60,
    CASE 
        WHEN c.symbol IN ('BTC', 'ETH', 'USDT', 'SOL') THEN 0.12
        ELSE 0.08
    END,
    true
FROM public.cryptocurrencies c
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'SOL')
ON CONFLICT (cryptocurrency_id, duration_days) DO NOTHING;

INSERT INTO public.vault_configurations (cryptocurrency_id, duration_days, apy, is_active)
SELECT 
    c.id,
    90,
    CASE 
        WHEN c.symbol IN ('BTC', 'ETH', 'USDT', 'SOL') THEN 0.15
        ELSE 0.12
    END,
    true
FROM public.cryptocurrencies c
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'SOL')
ON CONFLICT (cryptocurrency_id, duration_days) DO NOTHING;
