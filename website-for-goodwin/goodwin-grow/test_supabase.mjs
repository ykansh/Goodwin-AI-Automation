import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split('\n').map(line => line.split('=')));

const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/['"]/g, '') || 'https://placeholder.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY?.replace(/['"]/g, '') || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Fetching a project...');
  const { data: projData, error: projError } = await supabase.from('projects').select('id').limit(1).single();
  
  if (projError || !projData) {
    console.error('Error fetching project:', projError);
    return;
  }
  
  const projectId = projData.id;
  
  console.log('Inserting workflow...');
  const { data, error } = await supabase.from('workflows').insert({
    project_id: projectId,
    nodes: [{
      id: 'test-node',
      type: 'workflowNode',
      position: { x: 100, y: 100 },
      data: { label: 'Backend Injected Node', colorIdx: 2 }
    }],
    edges: []
  }).select().single();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Inserted workflow:', data.id);
  }
}

test();
