# ✅ OAuth Redirect Fix

## Masalah
OAuth redirect ke URL yang salah karena:
1. Server running di port 3001 tapi env hardcoded ke 3000
2. Supabase perlu whitelist redirect URL

## Solusi Applied

### 1. Dynamic Host Detection
**File:** `src/app/auth/actions.ts`

Sekarang menggunakan actual request host instead of hardcoded URL:
```typescript
// Get the current host from headers in development
const headers = await import('next/headers').then(m => m.headers());
const host = headers.get('host') || 'localhost:3000';
const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
const origin = `${protocol}://${host}`;
```

**Benefits:**
- ✅ Works on any port (3000, 3001, 3002, etc)
- ✅ Auto-detects localhost vs network IP
- ✅ No need to update .env when port changes

### 2. Supabase Config Required

**IMPORTANT:** Anda perlu whitelist redirect URLs di Supabase Dashboard!

**Cara:**
1. Buka https://supabase.com/dashboard
2. Pilih project: `obqmlpwuvkdedovfoeqt`
3. Settings → Authentication → URL Configuration
4. **Redirect URLs** → Add:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   http://127.0.0.1:3000/auth/callback
   http://127.0.0.1:3001/auth/callback
   ```

**Note:** Untuk production nanti, tambahkan production domain:
```
https://your-domain.com/auth/callback
```

---

## Testing

### 1. Restart Dev Server
```bash
pkill -f "next dev"
npm run dev
```

### 2. Test OAuth Flow
1. Buka: http://127.0.0.1:3001/auth/login (atau port yang digunakan)
2. Klik "Sign in with Google"
3. **Expected:**
   - Redirect ke Google OAuth
   - Login dengan Google
   - Redirect kembali ke http://127.0.0.1:3001/auth/callback
   - Redirect lagi ke /admin dashboard

### 3. Jika Masih Error

**Error dari Supabase:**
```
"redirect_uri mismatch" atau "URL not allowed"
```

**Solusi:** Pastikan URL sudah ditambahkan di Supabase Dashboard (langkah 2 di atas)

**Error lainnya:**
- Check console (F12) untuk detail error
- Verify NEXT_PUBLIC_SUPABASE_URL dan ANON_KEY benar

---

## Build Status

✅ Build SUCCESS  
✅ Dynamic host detection implemented  
⏳ Requires Supabase config update (manual)

---

**Updated:** 2026-07-25 13:52 WIB  
**Status:** Code fixed, Supabase config required
