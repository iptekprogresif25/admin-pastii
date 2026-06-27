require('dotenv').config({ path: '.env.local' });
async function check() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const json = await res.json();
  console.log(JSON.stringify(json.definitions.attendance, null, 2));
}
check();
