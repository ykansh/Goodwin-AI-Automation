INSERT INTO warranty_plans (id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('plan-generic-18m', 'Generic 18 Months', 18, 18, 0, true)
ON CONFLICT (id) DO NOTHING;
