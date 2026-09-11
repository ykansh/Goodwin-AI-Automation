
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testInsert() {
  const salespersonName = 'Test User ' + Math.random();
  const todayDate = new Date().toISOString().split('T')[0];
  
  const payload = {
      employee_id: `SP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      first_name: salespersonName,
      last_name: '',
      email: `${salespersonName.replace(/\s+/g, '').toLowerCase()}-${Math.floor(Math.random() * 10000)}@goodwin.local`,
      phone: '',
      department: 'Sales',
      designation: 'Salesperson',
      joining_date: todayDate,
      status: 'Active',
      basic_salary: 0
  };
  
  console.log("Inserting:", payload);
  const { data, error } = await supabase.from('hrms_employees').insert([payload]).select().single();
  
  if (error) {
      console.error("Supabase Error:", error);
  } else {
      console.log("Success:", data);
  }
}

testInsert();
