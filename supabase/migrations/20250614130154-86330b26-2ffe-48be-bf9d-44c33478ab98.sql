
-- First, add the missing column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update the handle_new_user function to match the actual table structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now delete any existing problematic test users
DELETE FROM auth.identities WHERE provider_id IN (
  SELECT id::text FROM auth.users WHERE email IN ('test@prompto.trading', 'admin@prompto.trading')
);
DELETE FROM public.profiles WHERE email IN ('test@prompto.trading', 'admin@prompto.trading');
DELETE FROM auth.users WHERE email IN ('test@prompto.trading', 'admin@prompto.trading');

-- Create test users with proper Supabase auth structure
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated', 
  'test@prompto.trading',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "TestUser", "full_name": "Test User"}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@prompto.trading', 
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "AdminUser", "full_name": "Admin User"}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
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

-- Ensure profiles exist for these users with proper column names
INSERT INTO public.profiles (id, email, username, full_name, is_admin)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'username',
  u.raw_user_meta_data->>'full_name',
  CASE WHEN u.email = 'admin@prompto.trading' THEN true ELSE false END
FROM auth.users u 
WHERE u.email IN ('test@prompto.trading', 'admin@prompto.trading')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  is_admin = EXCLUDED.is_admin;
