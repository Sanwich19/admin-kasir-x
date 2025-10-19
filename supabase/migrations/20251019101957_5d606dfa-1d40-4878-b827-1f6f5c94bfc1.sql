-- Fix 1: Create settings table with proper RLS for configuration management
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view settings
CREATE POLICY "All authenticated users can view settings"
ON public.settings
FOR SELECT
USING (true);

-- Only admins can insert/update/delete settings
CREATE POLICY "Admins can insert settings"
ON public.settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Fix 2: Add CHECK constraint to prevent negative stock
ALTER TABLE public.products
ADD CONSTRAINT stock_non_negative
CHECK (stock >= 0);

-- Insert default settings for existing installation
INSERT INTO public.settings (key, value, updated_by)
VALUES 
  ('shopName', 'Coffee Shop Admin', 'dd80629c-71c4-43f5-a3f6-245c0095581d'),
  ('address', 'Jl. Raya No. 123, Jakarta', 'dd80629c-71c4-43f5-a3f6-245c0095581d'),
  ('phone', '021-12345678', 'dd80629c-71c4-43f5-a3f6-245c0095581d'),
  ('email', 'admin@coffeeshop.com', 'dd80629c-71c4-43f5-a3f6-245c0095581d'),
  ('taxRate', '10', 'dd80629c-71c4-43f5-a3f6-245c0095581d')
ON CONFLICT (key) DO NOTHING;