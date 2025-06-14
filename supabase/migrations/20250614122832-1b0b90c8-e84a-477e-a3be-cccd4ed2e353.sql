
-- Fix NULL values in auth.users that are causing scan errors
UPDATE auth.users 
SET 
  email_change = '',
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, '')
WHERE email IN ('test@prompto.trading', 'admin@prompto.trading')
  AND (email_change IS NULL OR confirmation_token IS NULL OR recovery_token IS NULL);

-- Set admin privileges for the admin user
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'admin@prompto.trading';
