require('dotenv').config({ path: '.env.local' });
async function check() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    const json = await res.json();
    console.log(Object.keys(json.definitions));
    if (json.definitions.attendance) {
      console.log('attendance schema:', json.definitions.attendance);
    }
  } catch (e) {
    console.error(e);
  }
}
check();
