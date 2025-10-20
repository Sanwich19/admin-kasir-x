-- Insert Coffee menu items
INSERT INTO public.products (name, category, stock, price) VALUES
('Banana Coffee', 'Coffee', 100, 25000),
('Black Coffee', 'Coffee', 100, 23000),
('Cappucino', 'Coffee', 100, 23000),
('Caramel Latte', 'Coffee', 100, 25000),
('Cafe Latte', 'Coffee', 100, 23000),
('ES Kopi Olu', 'Coffee', 100, 25000),
('ES Kopi Pandan', 'Coffee', 100, 25000),
('ES Kopi Semangat', 'Coffee', 100, 25000),
('Hazelnut Latte', 'Coffee', 100, 25000),
('Tiramisu', 'Coffee', 100, 25000);

-- Insert Manual Brew items
INSERT INTO public.products (name, category, stock, price) VALUES
('Japanese', 'Manual Brew', 50, 23000),
('Special Beans', 'Manual Brew', 50, 0),
('V 60', 'Manual Brew', 50, 23000),
('Vietnam Drip', 'Manual Brew', 50, 23000);

-- Insert Tea Series items
INSERT INTO public.products (name, category, stock, price) VALUES
('Tea', 'Tea Series', 100, 20000),
('Lemon Tea', 'Tea Series', 100, 23000),
('Lychee Tea', 'Tea Series', 100, 25000),
('Lemon Grass Tea', 'Tea Series', 100, 25000),
('Wedang Uwuh', 'Tea Series', 100, 15000);

-- Insert Mocktail items
INSERT INTO public.products (name, category, stock, price) VALUES
('Nice Try', 'Mocktail', 50, 25000),
('Cuba', 'Mocktail', 50, 25000),
('Tropical Beauty', 'Mocktail', 50, 25000),
('Yellow Monkey', 'Mocktail', 50, 25000);

-- Insert Milk Based items
INSERT INTO public.products (name, category, stock, price) VALUES
('Banana Cheese Cake', 'Milk Based', 50, 26000),
('Chocolate', 'Milk Based', 50, 25000),
('Choco Hazelnut', 'Milk Based', 50, 26000),
('Klepon', 'Milk Based', 50, 26000),
('Matcha', 'Milk Based', 50, 25000),
('Red Velvet', 'Milk Based', 50, 25000),
('St. Cheese Cake', 'Milk Based', 50, 26000);

-- Insert Teman Kopi (Coffee Friends/Food) items
INSERT INTO public.products (name, category, stock, price) VALUES
('French Fries', 'Teman Kopi', 100, 20000),
('Cireng Rujak', 'Teman Kopi', 100, 20000),
('Cheese Stick', 'Teman Kopi', 100, 20000),
('Sharing Platter', 'Teman Kopi', 50, 25000),
('Singkong Colek', 'Teman Kopi', 100, 20000),
('Singkong Keju', 'Teman Kopi', 100, 23000),
('Mpek-Mpek', 'Teman Kopi', 100, 23000),
('Taichan', 'Teman Kopi', 50, 30000),
('Corn Ribs', 'Teman Kopi', 100, 20000);

-- Add Ice/Hot variants for Coffee category items
-- We'll add variants to existing coffee products
DO $$
DECLARE
    coffee_product RECORD;
BEGIN
    FOR coffee_product IN 
        SELECT id FROM public.products WHERE category = 'Coffee'
    LOOP
        INSERT INTO public.product_variants (product_id, name, price_adjustment)
        VALUES 
            (coffee_product.id, 'Hot', 0),
            (coffee_product.id, 'Ice', 0);
    END LOOP;
END $$;