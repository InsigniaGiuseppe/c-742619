
-- First, check what transaction types currently exist
DO $$
DECLARE
    existing_types text[];
BEGIN
    -- Get existing transaction types
    SELECT array_agg(DISTINCT transaction_type) 
    INTO existing_types
    FROM public.transaction_history;
    
    -- Log the existing types for debugging
    RAISE NOTICE 'Existing transaction types: %', existing_types;
END $$;

-- Update any invalid transaction types to valid ones
UPDATE public.transaction_history 
SET transaction_type = 'trade'
WHERE transaction_type NOT IN (
    'buy', 'sell', 'deposit', 'withdrawal', 'fee', 'dividend', 'interest',
    'lending_start', 'lending_cancelled', 'lending_interest_payment',
    'vault_deposit', 'vault_withdrawal', 'vault_payout',
    'spin_bet', 'spin_reward',
    'deposit_ideal', 'withdrawal_eur', 'withdrawal_crypto',
    'trade', 'lending_interest', 'transfer', 'bonus', 'refund'
);

-- Now drop and recreate the constraint
ALTER TABLE public.transaction_history 
DROP CONSTRAINT IF EXISTS transaction_history_transaction_type_check;

ALTER TABLE public.transaction_history 
ADD CONSTRAINT transaction_history_transaction_type_check 
CHECK (transaction_type IN (
    'buy', 'sell', 'deposit', 'withdrawal', 'fee', 'dividend', 'interest',
    'lending_start', 'lending_cancelled', 'lending_interest_payment',
    'vault_deposit', 'vault_withdrawal', 'vault_payout',
    'spin_bet', 'spin_reward',
    'deposit_ideal', 'withdrawal_eur', 'withdrawal_crypto',
    'trade', 'lending_interest', 'transfer', 'bonus', 'refund'
));
