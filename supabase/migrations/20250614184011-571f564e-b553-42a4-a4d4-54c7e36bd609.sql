
-- This function updates an external wallet's status and records the action in the audit log.
-- It ensures that wallet verification actions are always logged.
CREATE OR REPLACE FUNCTION public.update_wallet_status_and_log(
  target_wallet_id_in uuid,
  admin_id_in uuid,
  new_status_in public.wallet_status,
  admin_notes_in text
)
RETURNS void AS $$
DECLARE
  wallet_owner_id uuid;
  old_status public.wallet_status;
BEGIN
  -- Get the wallet's current status and owner for logging purposes
  SELECT user_id, status INTO wallet_owner_id, old_status
  FROM public.external_wallets
  WHERE id = target_wallet_id_in;

  -- Update the wallet's status and admin notes
  UPDATE public.external_wallets
  SET
    status = new_status_in,
    admin_notes = admin_notes_in,
    updated_at = now()
  WHERE id = target_wallet_id_in;

  -- Insert a record of this action into the admin audit log
  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action_type, details, ip_address)
  VALUES (
    admin_id_in,
    wallet_owner_id,
    'wallet_status_update',
    jsonb_build_object(
      'wallet_id', target_wallet_id_in,
      'old_status', old_status,
      'new_status', new_status_in,
      'admin_notes', admin_notes_in
    ),
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permission for authenticated users (i.e., logged-in admins) to use this function.
GRANT EXECUTE ON FUNCTION public.update_wallet_status_and_log(uuid, uuid, public.wallet_status, text) TO authenticated;
