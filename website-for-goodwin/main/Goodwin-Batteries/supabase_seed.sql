-- Insert Categories
INSERT INTO categories (id, name, slug, description, image) VALUES
('cat-1', 'Passenger Vehicles', 'passenger-vehicles', 'Reliable starting power for demanding journeys.', '/assets/products/placeholder-passenger.webp'),
('cat-2', 'Two Wheelers', 'two-wheelers', 'Quick starts and consistent performance for bikes and scooters.', '/assets/products/placeholder-bike.webp'),
('cat-3', 'Commercial Vehicles', 'commercial-vehicles', 'Heavy-duty power for trucks and commercial transport.', '/assets/products/placeholder-commercial.webp'),
('cat-4', 'Tractors', 'tractors', 'Built for tough agricultural environments.', '/assets/products/placeholder-tractor.webp'),
('cat-5', 'Three Wheelers', 'three-wheelers', 'Dependable energy for continuous city driving.', '/assets/products/placeholder-three-wheeler.webp'),
('cat-6', 'Industrial', 'industrial', 'High-capacity power for stationary and industrial use.', '/assets/products/placeholder-industrial.webp')
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (id, name, slug, series, category, voltage, ah, cca, warranty, application, image, description, features, terminallayout, dimensions, weight) VALUES
('prod-1', 'Goodwin ProStart 45', 'goodwin-prostart-45', 'ProStart', 'cat-1', '12V', '45 Ah', '380', '48 Months', ARRAY['Hatchbacks', 'Sedans'], '/assets/products/goodwin-12vgw-tz4lb.png', 'Premium automotive battery designed for modern passenger vehicles requiring reliable starts in any weather.', ARRAY['Maintenance-free design', 'High cranking power', 'Vibration resistant', 'Built for Indian conditions'], 'Standard', '238 x 129 x 227 mm', '12.5 kg'),
('prod-2', 'Goodwin DuraMax 65', 'goodwin-duramax-65', 'DuraMax', 'cat-1', '12V', '65 Ah', '550', '60 Months', ARRAY['SUVs', 'Luxury Vehicles'], '/assets/products/goodwin-12vgw-xl5lb.png', 'Maximum power for demanding vehicles loaded with electronics. Unmatched durability.', ARRAY['Advanced grid technology', 'Zero maintenance', 'High heat tolerance', 'Long life'], 'Standard', '260 x 173 x 225 mm', '16.8 kg'),
('prod-3', 'Goodwin Rider 5Ah', 'goodwin-rider-5ah', 'Rider', 'cat-2', '12V', '5 Ah', '80', '36 Months', ARRAY['Motorcycles', 'Scooters'], '/assets/products/goodwin-4smf5-torch-4v-5ah.png', 'Compact, reliable power for two-wheelers ensuring quick starts every time.', ARRAY['Spill-proof', 'VRLA technology', 'Quick recharge'], 'Standard Two-Wheeler', '113 x 70 x 105 mm', '1.8 kg'),
('prod-4', 'Goodwin Haulage 150', 'goodwin-haulage-150', 'Haulage', 'cat-3', '12V', '150 Ah', '900', '36 Months', ARRAY['Heavy Trucks', 'Buses'], '/assets/products/goodwin-vrla-12v-14ah.png', 'Extreme heavy-duty battery built to withstand the rigorous demands of commercial transport.', ARRAY['Thick plate construction', 'High reserve capacity', 'Extreme vibration resistance'], 'Standard Commercial', '510 x 220 x 230 mm', '42.0 kg')
ON CONFLICT (id) DO NOTHING;

-- Insert Vehicle Types
INSERT INTO vehicle_types (id, name) VALUES
('vt-1', 'Passenger Vehicle'),
('vt-2', 'Two Wheeler'),
('vt-3', 'Commercial Vehicle'),
('vt-4', 'Tractor')
ON CONFLICT (id) DO NOTHING;

-- Insert Manufacturers
INSERT INTO manufacturers (id, name, vehicletypeid) VALUES
('m-1', 'Maruti Suzuki', 'vt-1'),
('m-2', 'Hyundai', 'vt-1'),
('m-3', 'Mahindra', 'vt-1'),
('m-4', 'Honda', 'vt-2'),
('m-5', 'Bajaj', 'vt-2'),
('m-6', 'Tata Motors', 'vt-3'),
('m-7', 'Mahindra Tractors', 'vt-4')
ON CONFLICT (id) DO NOTHING;

-- Insert Vehicle Models
INSERT INTO vehicle_models (id, name, manufacturerid, fueltype, recommendedbatteryid) VALUES
('vm-1', 'Swift', 'm-1', 'Petrol', 'prod-1'),
('vm-2', 'Creta', 'm-2', 'Diesel', 'prod-2'),
('vm-3', 'Activa', 'm-4', 'Petrol', 'prod-3'),
('vm-4', 'Signa', 'm-6', 'Diesel', 'prod-4')
ON CONFLICT (id) DO NOTHING;

-- Insert Dealers
INSERT INTO dealers (id, name, address, city, state, pincode, phone, openinghours, latitude, longitude) VALUES
('d-1', 'Auto Power Point', '123, Main Road, Auto Nagar', 'Mumbai', 'Maharashtra', '400001', '9876543210', 'Mon-Sat: 9:00 AM - 8:00 PM', 18.922, 72.834),
('d-2', 'Reliable Battery Service', '45, Industrial Estate, Phase 1', 'Delhi', 'Delhi', '110020', '9876543211', 'Mon-Sun: 10:00 AM - 7:00 PM', 28.535, 77.271)
ON CONFLICT (id) DO NOTHING;
