const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: events } = await supabase.from('events').select('*').limit(1);
  const { data: presences } = await supabase.from('presences').select('*').limit(1);
  const { data: attendances } = await supabase.from('attendances').select('*').limit(1);
  const { data: event_attendances } = await supabase.from('event_attendances').select('*').limit(1);
  const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
  const { data: divisions } = await supabase.from('divisions').select('*').limit(1);
  
  console.log('events:', events);
  console.log('presences:', presences);
  console.log('attendances:', attendances);
  console.log('event_attendances:', event_attendances);
  console.log('profiles:', profiles);
  console.log('divisions:', divisions);
}
check();
