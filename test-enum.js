const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://obqmlpwuvkdedovfoeqt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icW1scHd1dmtkZWRvdmZvZXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc1Mjk1OCwiZXhwIjoyMDgzMzI4OTU4fQ.2A6-cCiDihRGYvWLbFpVw6L1LwlwjKZQzqsg1jOBop4');

async function run() {
  const { data, error } = await supabaseAdmin.from('profiles').select('status').limit(10);
  console.log('Statuses in use:', data.map(r => r.status));
}
run();
