require('dotenv').config({ path: '.env.local' });
async function check() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
  const json = await res.json();
  console.log(Object.keys(json));
  if (json.components && json.components.schemas) {
     console.log(Object.keys(json.components.schemas));
     console.log('attendance:', json.components.schemas.attendance);
  } else if (json.definitions) {
     console.log(Object.keys(json.definitions));
  }
}
check();
