require('dotenv').config({ path: '.env.local' });
// We don't have the user token, so we can't act as Haikal from node easily unless we fetch the cookie from the browser.
// But wait! My previous `test-db.js` ran ANONYMOUSLY and got 0 attendance records!
