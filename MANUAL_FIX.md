# 🔧 QUICK FIX GUIDE

## Masalah Saat Ini

Ada multiple Next.js dev server running di background yang conflict.

## Solusi Manual (Jalankan di terminal Anda)

```bash
# 1. Kill semua Next.js process
pkill -9 -f "next dev"

# 2. Clean semua port
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null

# 3. Clean cache Turbopack
rm -rf .next

# 4. Start fresh
npm run dev
```

## Test

Setelah `npm run dev` berhasil:

1. **Buka browser:** http://localhost:3000/auth/login
2. **Klik button:** "Sign in with Google"
3. **Cek console:** Seharusnya tidak ada WebSocket error lagi

## Fixes Yang Sudah Diterapkan

✅ WebSocket HMR - package.json updated dengan `--hostname 127.0.0.1`
✅ Login Button - Added `type="submit"` di SignInForm.tsx

## Jika Masih Error

Coba restart dari awal:
```bash
npm run clean
npm run dev
```

Akses hanya via:
- ✅ http://localhost:3000
- ✅ http://127.0.0.1:3000
- ❌ JANGAN http://192.168.0.134:3000
