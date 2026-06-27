const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://obqmlpwuvkdedovfoeqt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icW1scHd1dmtkZWRvdmZvZXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc1Mjk1OCwiZXhwIjoyMDgzMzI4OTU4fQ.2A6-cCiDihRGYvWLbFpVw6L1LwlwjKZQzqsg1jOBop4');

async function run() {
  const { error } = await supabaseAdmin.from('profiles').update({ status: 'inactive' }).eq('id', '4514fcb9-8376-45ea-ab63-855d1c0b93fd');
  if (error) {
    console.log('Error for inactive:', error);
  } else {
    console.log('Success with inactive');
    // revert
    await supabaseAdmin.from('profiles').update({ status: 'active' }).eq('id', '4514fcb9-8376-45ea-ab63-855d1c0b93fd');
  }
}
run();
