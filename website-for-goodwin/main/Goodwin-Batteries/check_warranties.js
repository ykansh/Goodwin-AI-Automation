const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  const { data: products, error } = await supabase.from('products').select('id, name, warranty, warranty_options');
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Found ${products.length} products`);
  console.log(products.slice(0, 5));
}
checkProducts();
