const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching products and plans...");
  
  const { data: products, error: pErr } = await supabase.from('products').select('*');
  if (pErr) throw pErr;
  
  const { data: plans, error: plErr } = await supabase.from('warranty_plans').select('*');
  if (plErr) throw plErr;

  console.log(`Found ${products.length} products and ${plans.length} plans.`);

  let sql = '-- AUTO-GENERATED WARRANTY PLANS MAPPING\n\n';

  for (const product of products) {
    const productPlans = plans.filter(p => p.product_id === product.id);
    const activePlans = productPlans.filter(p => p.active);

    if (activePlans.length > 1) {
      for (let i = 1; i < activePlans.length; i++) {
        sql += `UPDATE warranty_plans SET active = false WHERE id = '${activePlans[i].id}';\n`;
      }
    }

    if (activePlans.length === 0) {
      if (productPlans.length > 0) {
        sql += `UPDATE warranty_plans SET active = true WHERE id = '${productPlans[0].id}';\n`;
      } else {
        let wMonths = 12; // default
        if (product.warranty) {
          const match = product.warranty.match(/(\d+)/);
          if (match) wMonths = parseInt(match[1]);
        }
        
        let freeMonths = wMonths;
        let proRata = 0;
        
        if (wMonths > 12) {
          freeMonths = Math.floor(wMonths / 2);
          proRata = wMonths - freeMonths;
        }

        const planId = `plan-${product.id}-${wMonths}m`;
        
        // Use exact product name for the warranty plan name
        let planName = product.name;
        
        // If for some reason a product has multiple warranty options, append the months to distinguish
        if (wMonths.toString() !== (product.warranty || "").toString().replace(/[^0-9]/g, '')) {
            if (!planName.includes(`${wMonths}`)) {
                planName = `${product.name} - ${wMonths}M Option`;
            }
        }
        
        sql += `INSERT INTO warranty_plans (id, product_id, plan_name, warranty_months, free_replacement_months, pro_rata_months, active)
VALUES ('${planId}', '${product.id}', '${planName.replace(/'/g, "''")}', ${wMonths}, ${freeMonths}, ${proRata}, true)
ON CONFLICT (id) DO UPDATE SET plan_name = EXCLUDED.plan_name, active = true;\n\n`;
      }
    }
  }

  fs.writeFileSync('map_all_warranties.sql', sql);
  console.log("Generated map_all_warranties.sql. Please run it in Supabase SQL Editor.");
}

run().catch(console.error);
