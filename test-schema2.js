const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://obqmlpwuvkdedovfoeqt.supabase.co', 'sb_publishable_jEQmqfBq6WkY2irZnp1EqA_mSSMA0pO');
async function run() {
  const { data, error } = await supabase.from('profiles').select('status, is_active').limit(5);
  console.log(error ? error : data);
}
run();
