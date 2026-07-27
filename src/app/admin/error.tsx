'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="w-14 h-14 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center text-error-500 mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Terjadi Kesalahan Halaman Admin
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {error.message || 'Gagal memuat data dashboard. Terjadi kendala koneksi atau server.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
