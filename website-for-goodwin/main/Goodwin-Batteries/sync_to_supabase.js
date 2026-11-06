require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function run() {
  const data = JSON.parse(fs.readFileSync('data/goodwinProducts.json', 'utf8'));
  
  const dbRows = data.map(p => {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      series: p.series,
      // map category to category_id
      category_id: p.category, 
      voltage: p.voltage,
      ah: p.ah,
      cca: p.cca || null,
      warranty: p.warranty,
      warranty_options: p.warranty_options,
      image: p.image,
      description: p.description,
      is_published: p.is_published,
      features: p.features || null,
      terminal_layout: p.terminalLayout || null,
      dimensions: p.dimensions || null,
      weight: p.weight || null,
      application: p.application || []
    };
  });
  
  const { data: result, error } = await supabase.from('products').upsert(dbRows);
  if (error) {
    console.error("Error upserting:", error);
  } else {
    console.log("Upserted products successfully.");
  }
}

run();
