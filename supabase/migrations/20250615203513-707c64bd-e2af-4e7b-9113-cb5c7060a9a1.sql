
-- Fix the transaction_history constraint to include all transaction types used in the application
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
    'trade', 'lending_interest', 'transfer', 'bonus', 'refund',
    'admin_add', 'admin_remove', 'admin_balance_add', 'admin_balance_remove',
    'trade_buy', 'trade_sell'
));
