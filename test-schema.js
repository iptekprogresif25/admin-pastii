const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://obqmlpwuvkdedovfoeqt.supabase.co', 'sb_publishable_jEQmqfBq6WkY2irZnp1EqA_mSSMA0pO');
async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log(error ? error : Object.keys(data[0] || {}));
}
run();
