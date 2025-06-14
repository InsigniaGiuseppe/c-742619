
-- Phase 1: Database Schema Enhancement & Admin Foundation

-- Step 1: Create Audit Logging & Security Event Tables

-- For tracking actions performed by administrators
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.admin_audit_log IS 'Logs actions taken by administrators for accountability.';

-- For tracking security-related events
CREATE TABLE public.security_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.security_events_log IS 'Logs security-related events like failed logins or suspicious activity.';

-- Enable RLS for these tables
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins should be able to read these logs.
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_log FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view security logs"
  ON public.security_events_log FOR SELECT
  USING (public.is_admin(auth.uid()));


-- Step 2: Enhance Existing Tables

-- Create a new ENUM type for user account status
CREATE TYPE public.account_status_type AS ENUM ('active', 'frozen', 'blocked');

-- Add account_status column to profiles table
ALTER TABLE public.profiles
ADD COLUMN account_status account_status_type NOT NULL DEFAULT 'active';

COMMENT ON COLUMN public.profiles.account_status IS 'The current status of the user''s account (active, frozen, or blocked).';


-- Step 3: Implement Role-Based Permission System

-- Create an ENUM type for different admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'support', 'compliance');

-- Create a table to assign roles to users
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
COMMENT ON TABLE public.user_roles IS 'Assigns specific roles to users for granular permissions.';

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security function to check user roles
CREATE OR REPLACE FUNCTION public.check_user_role(user_id_to_check UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_id_to_check AND role = required_role
  );
END;
$$;
COMMENT ON FUNCTION public.check_user_role IS 'Checks if a user has a specific application role.';

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Insert the existing admin user into the new roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'admin@prompto.trading'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Add Platform Configuration Table

CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.platform_settings IS 'Stores global configuration settings for the platform.';

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_settings
CREATE POLICY "Admins can manage platform settings"
  ON public.platform_settings FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (auth.role() = 'authenticated');

