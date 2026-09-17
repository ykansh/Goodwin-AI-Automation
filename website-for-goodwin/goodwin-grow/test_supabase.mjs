import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split('\n').map(line => line.split('=')));

const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/['"]/g, '') || 'https://placeholder.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY?.replace(/['"]/g, '') || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase marketing_leads query...');
  const { data, error } = await supabase.from('marketing_leads').select('*');
  console.log('Current rows in Supabase:', { count: data?.length, error, data });
}

test();
