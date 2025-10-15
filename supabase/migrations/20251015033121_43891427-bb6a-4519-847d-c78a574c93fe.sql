-- Create role-based access control system
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'cashier');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Add missing UPDATE and DELETE policies to profiles table
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- 7. Create employees table with RLS
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  photo_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can insert employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins and managers can update employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can delete employees"
ON public.employees
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Create products table with RLS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins and managers can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Create transactions table with RLS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  customer_name TEXT,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "All authenticated users can insert transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 10. Create shifts table with RLS
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'ongoing', 'completed')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view shifts"
ON public.shifts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can insert shifts"
ON public.shifts
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins and managers can update shifts"
ON public.shifts
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can delete shifts"
ON public.shifts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 11. Create storage bucket for employee photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', false);

-- 12. Storage policies for employee photos
CREATE POLICY "Authenticated users can view employee photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'employee-photos');

CREATE POLICY "Admins and managers can upload employee photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-photos' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

CREATE POLICY "Admins and managers can update employee photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'employee-photos' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
)
WITH CHECK (
  bucket_id = 'employee-photos' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

CREATE POLICY "Admins can delete employee photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'employee-photos' AND
  public.has_role(auth.uid(), 'admin')
);

-- 13. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();