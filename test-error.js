const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://obqmlpwuvkdedovfoeqt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icW1scHd1dmtkZWRvdmZvZXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc1Mjk1OCwiZXhwIjoyMDgzMzI4OTU4fQ.2A6-cCiDihRGYvWLbFpVw6L1LwlwjKZQzqsg1jOBop4');

async function run() {
  let queryBuilder = supabaseAdmin
    .from('profiles')
    .select(`
      id,
      full_name,
      role,
      division_id,
      division:divisions!profiles_division_id_fkey(name)
    `, { count: 'exact' })
    .eq('is_active', true);

  const { data, count, error } = await queryBuilder
    .order('full_name', { ascending: true })
    .range(0, 9);
    
  console.log('Error:', error);
}
run();
