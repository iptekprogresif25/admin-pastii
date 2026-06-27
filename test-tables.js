const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
  const tables = ['attendance', 'attendances', 'presences', 'event_attendance', 'event_attendances', 'event_presences', 'event_participants', 'checkins', 'event_checkins'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`Table exists: ${table}`);
    } else {
      console.log(`Table ${table} error:`, error.code);
    }
  }
}
check();
