const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Using the service key or manually outputting SQL since RLS might block updates
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error(error);
    return;
  }

  let sql = '-- UPDATE PRODUCT NAMES TO INCLUDE WARRANTY\n\n';

  for (const p of products) {
    // e.g. warranty is "48 Months"
    // If the name doesn't include "Months" or "48", let's append it
    const warrantyStr = p.warranty || '';
    if (warrantyStr && !p.name.includes(warrantyStr) && !p.name.includes('Months')) {
      const newName = `${p.name} (${warrantyStr})`;
      sql += `UPDATE products SET name = '${newName.replace(/'/g, "''")}' WHERE id = '${p.id}';\n`;
    }
  }

  const fs = require('fs');
  fs.writeFileSync('update_product_names.sql', sql);
  console.log('Generated update_product_names.sql');
}

run();
