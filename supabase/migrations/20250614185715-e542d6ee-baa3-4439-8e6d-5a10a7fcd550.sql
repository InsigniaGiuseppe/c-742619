
-- This script is designed to be idempotent and handle potential leftover state from previous failed migrations.

-- Drop the function if it exists, to recreate it with the correct signature.
DROP FUNCTION IF EXISTS public.update_transaction_status_and_log(uuid, uuid, text, text);

-- Create the ENUM type if it doesn't already exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_type') THEN
        CREATE TYPE public.order_status_type AS ENUM (
            'pending',
            'completed',
            'rejected',
            'failed'
        );
    END IF;
END$$;


-- Safely migrate the column type from text to the new enum type.
-- This is done by adding a new column, copying data, dropping the old, and renaming the new.
-- This is more robust than a direct ALTER COLUMN TYPE.
DO $$
BEGIN
    -- Add a temporary new column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trading_orders' AND column_name = 'order_status_new') THEN
        ALTER TABLE public.trading_orders ADD COLUMN order_status_new public.order_status_type;
    END IF;

    -- Copy and cast data from old column to new column if the old column is still text
    IF (SELECT udt_name FROM information_schema.columns WHERE table_name = 'trading_orders' AND column_name = 'order_status') = 'text' THEN
        UPDATE public.trading_orders SET order_status_new = order_status::public.order_status_type WHERE order_status IS NOT NULL;
        
        -- Drop the old column
        ALTER TABLE public.trading_orders DROP COLUMN order_status;
        
        -- Rename new column to old column name
        ALTER TABLE public.trading_orders RENAME COLUMN order_status_new TO order_status;
        
        -- Set the default value on the new column
        ALTER TABLE public.trading_orders ALTER COLUMN order_status SET DEFAULT 'pending'::public.order_status_type;
    END IF;
END$$;


-- This function updates a transaction's status and records the action in the audit log.
CREATE OR REPLACE FUNCTION public.update_transaction_status_and_log(
  target_order_id_in uuid,
  admin_id_in uuid,
  new_status_in text,
  admin_notes_in text
)
RETURNS void AS $function$
DECLARE
  transaction_owner_id uuid;
  old_status public.order_status_type;
  new_status_casted public.order_status_type;
BEGIN
  -- Cast the text input to the enum type to ensure it's a valid status
  new_status_casted := new_status_in::public.order_status_type;

  -- Get the transaction's current status and owner for logging purposes
  SELECT user_id, order_status INTO transaction_owner_id, old_status
  FROM public.trading_orders
  WHERE id = target_order_id_in;

  -- Update the trading_orders table
  UPDATE public.trading_orders
  SET
    order_status = new_status_casted,
    updated_at = now()
  WHERE id = target_order_id_in;

  -- Insert a record of this action into the admin audit log
  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action_type, details, ip_address)
  VALUES (
    admin_id_in,
    transaction_owner_id,
    'transaction_status_update',
    jsonb_build_object(
      'order_id', target_order_id_in,
      'old_status', old_status::text,
      'new_status', new_status_in,
      'admin_notes', admin_notes_in
    ),
    inet_client_addr()
  );
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permission for authenticated users (i.e., logged-in admins) to use this function.
GRANT EXECUTE ON FUNCTION public.update_transaction_status_and_log(uuid, uuid, text, text) TO authenticated;
