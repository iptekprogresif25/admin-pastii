# README untuk Developer

## Setup Development Environment

### Persyaratan
- Node.js 20+
- npm atau yarn
- Supabase account

### Installation

1. Clone repository:
```bash
git clone https://github.com/iptekprogresif25/admin-pastii.git
cd admin-pastii
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` dengan credentials Supabase Anda:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Run development server:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Development Commands

```bash
npm run dev          # Start development server (localhost only)
npm run dev:host     # Start dev server accessible from network (0.0.0.0)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint errors
npm run type-check   # TypeScript type checking
npm run clean        # Clean cache
```

## Struktur Proyek

```
pastii-admin/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Protected admin routes
│   │   ├── auth/           # Authentication pages
│   │   └── api/            # API routes
│   ├── components/         # Reusable UI components
│   ├── lib/                # Data access layer & business logic
│   ├── utils/              # Utility functions
│   ├── context/            # React contexts
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── .env.local             # Environment variables (not committed)
```

## Best Practices

### Data Fetching
- Use Server Components for data fetching by default
- Use Server Actions for mutations
- Client Components only for interactivity

### Caching
- Server Actions automatically call `revalidatePath()`
- Don't use `router.refresh()` in App Router
- Use `unstable_cache()` for static data

### Type Safety
- Never use `any` type - define proper interfaces
- Use `as const` for constants
- Catch errors with proper typing: `err instanceof Error`

### Error Handling
- Use `toast` from sonner for user feedback
- No `alert()` or `console.log()` in production code
- Add error boundaries for critical sections

## Common Issues

### WebSocket HMR Connection Failed
**Symptom:** Console spam `WebSocket connection to 'ws://192.168.0.134:3000/_next/webpack-hmr' failed`

**Solution:**
- Use `npm run dev` (localhost only) for normal development
- Use `npm run dev:host` only when you need to access from other devices
- Check your firewall settings if still failing

### sonner Module Not Found
**Solution:**
```bash
npm install sonner --save --force
```

## Database Schema

Lihat file `QA_AUDIT_REPORT.md` untuk dokumentasi lengkap schema database.

## Testing

Testing framework belum disetup. Contribution welcome!

## Contributing

1. Branch dari `main`
2. Commit dengan conventional commits format
3. Submit PR dengan deskripsi lengkap
4. Pastikan `npm run lint` dan `npm run build` sukses

## License

Internal use only - HIMA-TI
