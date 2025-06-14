
-- Drop the existing foreign key constraints that incorrectly point to the auth.users table.
-- We know the name of the first one from the error log, and the second follows a standard pattern.
ALTER TABLE public.admin_audit_log DROP CONSTRAINT "admin_audit_log_admin_id_fkey";
ALTER TABLE public.admin_audit_log DROP CONSTRAINT "admin_audit_log_target_user_id_fkey";

-- Now, add back the constraints, but this time correctly pointing to the public.profiles table.
-- This allows us to easily look up user names and details for the log.
ALTER TABLE public.admin_audit_log
ADD CONSTRAINT admin_audit_log_admin_id_fkey
FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.admin_audit_log
ADD CONSTRAINT admin_audit_log_target_user_id_fkey
FOREIGN KEY (target_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
