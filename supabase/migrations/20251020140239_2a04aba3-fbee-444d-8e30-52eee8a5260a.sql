-- Update all product categories to only "Makanan" or "Minuman"

-- Update beverage categories to "Minuman"
UPDATE public.products 
SET category = 'Minuman'
WHERE category IN ('Coffee', 'Manual Brew', 'Tea Series', 'Mocktail', 'Milk Based', 'Minuman', 'Kopi');

-- Update food categories to "Makanan"
UPDATE public.products 
SET category = 'Makanan'
WHERE category IN ('Teman Kopi', 'Makanan', 'Snack', 'Food');

-- Clean up any remaining categories (set to Makanan as default)
UPDATE public.products 
SET category = 'Makanan'
WHERE category NOT IN ('Makanan', 'Minuman');