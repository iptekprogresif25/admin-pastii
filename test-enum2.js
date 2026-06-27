const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://obqmlpwuvkdedovfoeqt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icW1scHd1dmtkZWRvdmZvZXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc1Mjk1OCwiZXhwIjoyMDgzMzI4OTU4fQ.2A6-cCiDihRGYvWLbFpVw6L1LwlwjKZQzqsg1jOBop4');

async function run() {
  const { data, error } = await supabaseAdmin.rpc('get_enum_values', { enum_name: 'account_status' });
  // If rpc doesn't exist, we can use psql but wait we don't have direct sql. We can query information_schema or pg_type.
  const res = await supabaseAdmin.from('profiles').select('status').neq('status', 'active');
  console.log('Other statuses:', res.data);
}
run();
