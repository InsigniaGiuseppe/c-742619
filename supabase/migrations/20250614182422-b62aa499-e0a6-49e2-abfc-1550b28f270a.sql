
-- This function updates a user's status and records the action in the audit log.
-- It ensures that status updates are always logged.
CREATE OR REPLACE FUNCTION public.update_user_status_and_log(
  target_user_id_in uuid,
  admin_id_in uuid,
  new_status text
)
RETURNS void AS $$
DECLARE
  old_status text;
  new_status_casted public.account_status_type;
BEGIN
  -- Cast the text input to the enum type to ensure it's a valid status
  new_status_casted := new_status::public.account_status_type;

  -- Get the user's current status for logging purposes
  SELECT account_status INTO old_status FROM public.profiles WHERE id = target_user_id_in;

  -- Update the user's account status in the profiles table
  UPDATE public.profiles
  SET account_status = new_status_casted
  WHERE id = target_user_id_in;

  -- Insert a record of this action into the admin audit log
  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action_type, details, ip_address)
  VALUES (
    admin_id_in,
    target_user_id_in,
    'user_status_update',
    jsonb_build_object(
      'old_status', old_status,
      'new_status', new_status
    ),
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permission for authenticated users (i.e., logged-in admins) to use this function.
GRANT EXECUTE ON FUNCTION public.update_user_status_and_log(uuid, uuid, text) TO authenticated;
