
-- This function updates a KYC document's status and the user's profile, then records the action in the audit log.
CREATE OR REPLACE FUNCTION public.update_kyc_status_and_log(
  target_kyc_id_in uuid,
  admin_id_in uuid,
  new_status_in public.kyc_status,
  admin_notes_in text
)
RETURNS void AS $$
DECLARE
  kyc_owner_id uuid;
  old_status public.kyc_status;
BEGIN
  -- Get the kyc document's current status and owner for logging purposes
  SELECT user_id, status INTO kyc_owner_id, old_status
  FROM public.kyc_documents
  WHERE id = target_kyc_id_in;

  -- Update the kyc_documents table
  UPDATE public.kyc_documents
  SET
    status = new_status_in,
    admin_notes = admin_notes_in,
    updated_at = now()
  WHERE id = target_kyc_id_in;

  -- Also update the user's main kyc_status on their profile
  UPDATE public.profiles
  SET
    kyc_status = new_status_in
  WHERE id = kyc_owner_id;

  -- Insert a record of this action into the admin audit log
  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action_type, details, ip_address)
  VALUES (
    admin_id_in,
    kyc_owner_id,
    'kyc_status_update',
    jsonb_build_object(
      'kyc_document_id', target_kyc_id_in,
      'old_status', old_status,
      'new_status', new_status_in,
      'admin_notes', admin_notes_in
    ),
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permission for authenticated users (i.e., logged-in admins) to use this function.
GRANT EXECUTE ON FUNCTION public.update_kyc_status_and_log(uuid, uuid, public.kyc_status, text) TO authenticated;
