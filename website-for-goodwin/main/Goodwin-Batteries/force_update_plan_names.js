const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products } = await supabase.from('products').select('*');
  const { data: plans } = await supabase.from('warranty_plans').select('*');

  let sql = '-- FORCE UPDATE ALL WARRANTY PLAN NAMES TO MATCH PRODUCT TITLES\n\n';

  for (const plan of plans) {
    const product = products.find(p => p.id === plan.product_id);
    if (product) {
      const planName = product.name; // e.g. "GW-TZ4LB (48 Months)"
      sql += `UPDATE warranty_plans SET plan_name = '${planName.replace(/'/g, "''")}' WHERE id = '${plan.id}';\n`;
    }
  }

  fs.writeFileSync('map_all_warranties.sql', sql);
  console.log("Successfully generated map_all_warranties.sql");
}

run();
