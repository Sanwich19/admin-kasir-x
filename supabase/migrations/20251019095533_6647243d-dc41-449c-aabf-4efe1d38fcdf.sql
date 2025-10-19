-- Add notes column to transactions items
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add comment for clarity
COMMENT ON COLUMN transactions.customer_phone IS 'Customer phone number for contact';

-- Create products_variants table for product variants (hot/ice for coffee, etc)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Hot", "Ice"
  price_adjustment NUMERIC DEFAULT 0, -- Additional price for this variant
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_variants
CREATE POLICY "All authenticated users can view product variants"
ON public.product_variants
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can insert product variants"
ON public.product_variants
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update product variants"
ON public.product_variants
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete product variants"
ON public.product_variants
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();