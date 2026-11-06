const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// get from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);
async function go() {
  const { data } = await supabase.from('applications').select('*').eq('is_published', true).order('display_order', { ascending: true });
  console.log(JSON.stringify(data, null, 2));
}
go();
