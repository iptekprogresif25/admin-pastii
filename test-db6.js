const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
  const { error } = await supabase.from('attendance').insert([{ id: 1, invalid_col: 1 }]);
  console.log('error:', error);
}
check();
