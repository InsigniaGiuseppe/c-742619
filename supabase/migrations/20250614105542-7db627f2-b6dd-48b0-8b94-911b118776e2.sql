
-- Delete existing test users if they exist
DELETE FROM auth.users WHERE email IN ('test@prompto.trading', 'admin@prompto.trading');

-- Create test user with proper Supabase auth structure
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  email_change_confirm_status
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated', 
  'test@prompto.trading',
  crypt('password123', gen_salt('bf')),
  now(), -- Email confirmed immediately
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "TestUser", "full_name": "Test User"}',
  false,
  now(),
  now(),
  0
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@prompto.trading', 
  crypt('admin123', gen_salt('bf')),
  now(), -- Email confirmed immediately
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "AdminUser", "full_name": "Admin User"}',
  false,
  now(),
  now(),
  0
);

-- Create corresponding identities for proper auth flow (without email field since it's generated)
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) 
SELECT 
  u.id::text,
  u.id,
  format('{"sub": "%s", "email": "%s", "email_verified": true}', u.id, u.email)::jsonb,
  'email',
  now(),
  now(),
  now()
FROM auth.users u 
WHERE u.email IN ('test@prompto.trading', 'admin@prompto.trading');
