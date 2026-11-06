-- SEED WARRANTY PLANS FOR ALL PRODUCTS

INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-tz4lb', 'prod-tz4lb', 'GW-TZ4LB Standard (48M)', 48, 24, 24, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-xl5lb', 'prod-xl5lb', 'GW-XL5LB Standard (48M)', 48, 24, 24, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-xl25lc', 'prod-xl25lc', 'GW-XL2.5LC Standard (48M)', 48, 24, 24, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-tz5lb', 'prod-tz5lb', 'GW-TZ5LB Standard (48M)', 48, 24, 24, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-12smf8', 'prod-12smf8', 'GW-12SMF8-UPS Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-4smf5', 'prod-4smf5', 'GW-4SMF5 Standard (6M)', 6, 6, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-4v7ah', 'prod-4v7ah', 'GW-4V7AH-VRLA Standard (6M)', 6, 6, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-6v5ah', 'prod-6v5ah', 'GW-6V5AH Standard (6M)', 6, 6, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-li-agro14', 'prod-li-agro14', 'GW-LITHIUM-AGRO-14AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-li-ups8', 'prod-li-ups8', 'GW-LITHIUM-UPS-8AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-vrla-agro14', 'prod-vrla-agro14', 'GW-VRLA-AGRO-14AH Standard (6M)', 6, 6, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-14ah', 'prod-gold-14ah', 'GW-GOLD 14AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-inverter-tubular', 'prod-inverter-tubular', 'GW-INVERTER TUBULAR Standard (72M)', 72, 36, 36, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-series-6v-4-2ah', 'prod-gold-series-6v-4-2ah', 'GOLD SERIES 6V 4.2AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-series-12v-12ah', 'prod-gold-series-12v-12ah', 'GOLD SERIES 12V 12AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-series-12v-15ah', 'prod-gold-series-12v-15ah', 'GOLD SERIES 12V 15AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-series-6v-4-5ah', 'prod-gold-series-6v-4-5ah', 'GOLD SERIES 6V 4.5AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-series-12v-7-2ah', 'prod-gold-series-12v-7-2ah', 'GOLD SERIES 12V 7.2AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-series-12v-9ah', 'prod-gold-series-12v-9ah', 'GOLD SERIES 12V 9AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;
INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-prod-gold-series-12v-17ah', 'prod-gold-series-12v-17ah', 'GOLD SERIES 12V 17AH Standard (12M)', 12, 12, 0, true)
ON CONFLICT (id) DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  warranty_months = EXCLUDED.warranty_months,
  free_replacement_months = EXCLUDED.free_replacement_months,
  pro_rata_months = EXCLUDED.pro_rata_months;

-- INSERT DUMMY INVENTORY FOR TESTING
INSERT INTO battery_serials (serial_number, product_id, status)
VALUES 
  ('TEST-TZ4LB-001', 'prod-tz4lb', 'INVENTORY'),
  ('TEST-XL5LB-002', 'prod-xl5lb', 'INVENTORY'),
  ('TEST-12SMF-003', 'prod-12smf8', 'INVENTORY')
ON CONFLICT (serial_number) DO NOTHING;
