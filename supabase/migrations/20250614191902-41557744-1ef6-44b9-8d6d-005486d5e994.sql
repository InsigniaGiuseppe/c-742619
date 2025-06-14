
-- Drop the existing, incorrect foreign key constraint if it exists.
ALTER TABLE public.trading_orders
DROP CONSTRAINT IF EXISTS trading_orders_user_id_fkey;

-- Add the correct foreign key constraint, linking to the 'profiles' table.
ALTER TABLE public.trading_orders
ADD CONSTRAINT trading_orders_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also update the foreign key for transaction_history for consistency.
ALTER TABLE public.transaction_history
DROP CONSTRAINT IF EXISTS transaction_history_user_id_fkey;

ALTER TABLE public.transaction_history
ADD CONSTRAINT transaction_history_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
