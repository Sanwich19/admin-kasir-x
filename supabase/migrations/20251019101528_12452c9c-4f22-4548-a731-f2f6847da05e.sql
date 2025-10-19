-- Fix: No mechanism to assign roles to users
-- This migration addresses the critical error where users cannot be assigned roles

-- Step 1: Bootstrap the existing user as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('dd80629c-71c4-43f5-a3f6-245c0095581d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 2: Create function to automatically assign default 'cashier' role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cashier');
  RETURN NEW;
END;
$$;

-- Step 3: Create trigger to execute the function when new users sign up
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();