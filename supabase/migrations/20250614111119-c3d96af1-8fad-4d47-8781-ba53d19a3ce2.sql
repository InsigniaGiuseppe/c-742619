
-- Fix NULL confirmation_token and recovery_token issue for test/admin users to resolve Supabase auth database query error
UPDATE auth.users
SET confirmation_token = ''
WHERE email IN ('test@prompto.trading', 'admin@prompto.trading')
  AND confirmation_token IS NULL;

UPDATE auth.users
SET recovery_token = ''
WHERE email IN ('test@prompto.trading', 'admin@prompto.trading')
  AND recovery_token IS NULL;
