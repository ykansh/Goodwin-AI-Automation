-- ==============================================================================================
-- GOODWIN BATTERIES - REAL PRODUCT SEED DATA
-- Execute this in the Supabase SQL Editor
-- ==============================================================================================

-- 1. Categories
INSERT INTO categories (id, name, slug, description, image, display_order) VALUES
('cat-1', 'Motorcycle / 2W', 'motorcycle-2w', 'Quick starts and consistent performance for bikes and scooters.', '/assets/products/placeholder-bike.webp', 1),
('cat-2', 'Automotive & Toys', 'automotive-toys', 'Reliable power for automotive toys and specialized equipment.', '/assets/products/placeholder-passenger.webp', 2),
('cat-3', 'Solar & VRLA / Agro', 'solar-vrla', 'Dependable energy for UPS, solar, and agricultural applications.', '/assets/products/placeholder-industrial.webp', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 2. Products
-- We use unique slugs by appending the warranty months to identical models
INSERT INTO products (id, name, slug, series, category_id, voltage, ah, warranty, image, is_published, display_order) VALUES
('p-1', 'Goodwin 6V 5Ah Toy Battery', 'goodwin-6v-5ah-toy-6m', 'Toy', 'cat-2', '6V', '5Ah', '6 Months', '/assets/products/goodwin-6v-5ah-toy.png', true, 1),
('p-2', 'Goodwin 4SMF5 Torch Battery', 'goodwin-4smf5-torch-6m', 'Torch', 'cat-2', '4V', '5Ah', '6 Months', '/assets/products/goodwin-4smf5-torch-4v-5ah.png', true, 2),
('p-3', 'Goodwin 4V 7Ah Toy Battery', 'goodwin-4v-7ah-toy-6m', 'Toy', 'cat-2', '4V', '7Ah', '6 Months', '/assets/products/goodwin-4v-7ah-vrla.png', true, 3),

('p-4', 'GW-TZ4LB 12V 4Ah (48M)', 'gw-tz4lb-12v-4ah-48m', 'GW Series', 'cat-1', '12V', '4Ah', '48 Months', '/assets/products/goodwin-12vgw-tz4lb.png', true, 4),
('p-5', 'GW-TZ4LB 12V 4Ah (18M)', 'gw-tz4lb-12v-4ah-18m', 'GW Series', 'cat-1', '12V', '4Ah', '18 Months', '/assets/products/goodwin-12vgw-tz4lb.png', true, 5),
('p-6', 'GW-TZ4LB 12V 4Ah (12M)', 'gw-tz4lb-12v-4ah-12m', 'GW Series', 'cat-1', '12V', '4Ah', '12 Months', '/assets/products/goodwin-12vgw-tz4lb.png', true, 6),

('p-7', 'GW-XL5LB 12V 5Ah (48M)', 'gw-xl5lb-12v-5ah-48m', 'GW Series', 'cat-1', '12V', '5Ah', '48 Months', '/assets/products/goodwin-12vgw-xl5lb.png', true, 7),
('p-8', 'GW-XL5LB 12V 5Ah (18M)', 'gw-xl5lb-12v-5ah-18m', 'GW Series', 'cat-1', '12V', '5Ah', '18 Months', '/assets/products/goodwin-12vgw-xl5lb.png', true, 8),
('p-9', 'GW-XL5LB 12V 5Ah (12M)', 'gw-xl5lb-12v-5ah-12m', 'GW Series', 'cat-1', '12V', '5Ah', '12 Months', '/assets/products/goodwin-12vgw-xl5lb.png', true, 9),

('p-10', 'GW-XL2.5LC 12V 2.5Ah (48M)', 'gw-xl2-5lc-12v-2-5ah-48m', 'GW Series', 'cat-1', '12V', '2.5Ah', '48 Months', '/assets/products/goodwin-12gw-xl2-5lc.png', true, 10),
('p-11', 'GW-XL2.5LC 12V 2.5Ah (18M)', 'gw-xl2-5lc-12v-2-5ah-18m', 'GW Series', 'cat-1', '12V', '2.5Ah', '18 Months', '/assets/products/goodwin-12gw-xl2-5lc.png', true, 11),
('p-12', 'GW-XL2.5LC 12V 2.5Ah (12M)', 'gw-xl2-5lc-12v-2-5ah-12m', 'GW Series', 'cat-1', '12V', '2.5Ah', '12 Months', '/assets/products/goodwin-12gw-xl2-5lc.png', true, 12),

('p-13', 'GW-TZ5LB 12V 5Ah (48M)', 'gw-tz5lb-12v-5ah-48m', 'GW Series', 'cat-1', '12V', '5Ah', '48 Months', '/assets/products/goodwin-12vgw-tz5lb.png', true, 13),
('p-14', 'GW-TZ5LB 12V 5Ah (18M)', 'gw-tz5lb-12v-5ah-18m', 'GW Series', 'cat-1', '12V', '5Ah', '18 Months', '/assets/products/goodwin-12vgw-tz5lb.png', true, 14),
('p-15', 'GW-TZ5LB 12V 5Ah (12M)', 'gw-tz5lb-12v-5ah-12m', 'GW Series', 'cat-1', '12V', '5Ah', '12 Months', '/assets/products/goodwin-12vgw-tz5lb.png', true, 15),

('p-16', 'Goodwin Lithium UPS Battery', 'goodwin-lithium-ups-12v-8ah', 'Lithium', 'cat-3', '12V', '8Ah', '12 Months', '/assets/products/goodwin-lithium-ups-12v-8ah.png', true, 16),
('p-17', 'Goodwin 12SMF8 UPS Battery', 'goodwin-12smf8-ups-12v-8ah', 'SMF', 'cat-3', '12V', '8Ah', '6 Months', '/assets/products/goodwin-12smf8-ups-12v-8ah.png', true, 17),
('p-18', 'Goodwin 12SMF12 Agro Battery', 'goodwin-12smf12-agro-12v-12ah', 'Agro', 'cat-3', '12V', '12Ah', '6 Months', '/assets/products/goodwin-vrla-12v-14ah.png', true, 18),
('p-19', 'Goodwin 12V 14Ah SMF Agro', 'goodwin-smf-agro-12v-14ah', 'Agro', 'cat-3', '12V', '14Ah', '6 Months', '/assets/products/goodwin-vrla-12v-14ah.png', true, 19),
('p-20', 'Goodwin Lithium Agro Battery', 'goodwin-lithium-agro-12v-14ah', 'Lithium', 'cat-3', '12V', '14Ah', '12 Months', '/assets/products/goodwin-lithium-agro-12v-14ah.png', true, 20)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, category_id = EXCLUDED.category_id, voltage = EXCLUDED.voltage, ah = EXCLUDED.ah, warranty = EXCLUDED.warranty, image = EXCLUDED.image;
