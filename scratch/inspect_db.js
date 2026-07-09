const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('--- INSPECTING DATABASE ---');
  
  // Businesses
  const { data: businesses, error: bErr } = await supabase.from('businesses').select('*');
  if (bErr) console.error('Businesses error:', bErr);
  else console.log('Businesses:', businesses);

  // Services
  const { data: services, error: sErr } = await supabase.from('services').select('*');
  if (sErr) console.error('Services error:', sErr);
  else console.log('Services:', services);

  // Leads
  const { data: leads, error: lErr } = await supabase.from('leads').select('*');
  if (lErr) console.error('Leads error:', lErr);
  else console.log('Leads:', leads);
}

inspect();
