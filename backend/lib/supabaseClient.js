const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

// Initialize Supabase only if environment variables are provided
if (supabaseUrl && supabaseServiceRoleKey && 
    supabaseUrl !== 'your_supabase_project_url' && 
    supabaseServiceRoleKey !== 'your_supabase_service_role_key') {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    console.log('Supabase client successfully initialized.');
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message);
  }
} else {
  console.log('Supabase credentials not configured yet. Running in Mock Data mode.');
}

/**
 * Helper to check if Supabase is active and connected.
 * In Phase 3, this will be used to route calls to the database instead of the mock store.
 */
const isSupabaseConfigured = () => {
  return supabase !== null;
};

module.exports = {
  supabase,
  isSupabaseConfigured
};
