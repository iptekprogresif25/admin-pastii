const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
  const { data, error } = await supabase.from('events').select(`
    *,
    attendance (
      *,
      profiles (
        full_name,
        divisions (
          name
        )
      )
    )
  `).limit(1);
  console.log('error:', error);
  console.log('data:', JSON.stringify(data, null, 2));
}
check();
