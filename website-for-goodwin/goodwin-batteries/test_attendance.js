
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testAttendance() {
  // First get an employee
  const { data: emps, error: eErr } = await supabase.from('hrms_employees').select('*').limit(1);
  if (eErr || !emps || emps.length === 0) {
      console.error("Could not fetch any employee:", eErr);
      return;
  }
  
  const emp = emps[0];
  const payload = {
      employee_id: emp.id,
      date: new Date().toISOString().split('T')[0],
      check_in: '09:00:00',
      check_out: '18:00:00',
      status: 'Present',
      notes: ''
  };
  
  console.log("Inserting attendance:", payload);
  const { data, error } = await supabase.from('hrms_attendance').insert([payload]).select().single();
  
  if (error) {
      console.error("Supabase Error:", error);
  } else {
      console.log("Success:", data);
  }
}

testAttendance();
