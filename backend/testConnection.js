import { supabase } from './supabase.js';

async function testConnection() {
  const { data, error } = await supabase.from('_test_connection').select('*').limit(1);

  if (!error || error.message.includes('schema cache') || error.code === '42P01') {
    console.log('✓ Supabase connected successfully');
    console.log('  URL:', process.env.SUPABASE_URL);
  } else {
    console.error('✗ Connection error:', error.message);
  }
}

testConnection();
