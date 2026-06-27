const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: presences, error: err1 } = await supabase.from('presences').select('*').limit(1);
  const { data: attendances, error: err2 } = await supabase.from('attendances').select('*').limit(1);
  const { data: event_attendances, error: err3 } = await supabase.from('event_attendances').select('*').limit(1);
  const { data: event_presences, error: err4 } = await supabase.from('event_presences').select('*').limit(1);
  
  console.log('err1:', err1);
  console.log('err2:', err2);
  console.log('err3:', err3);
  console.log('err4:', err4);
}
check();
