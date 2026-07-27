'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-900">
      <div className="w-16 h-16 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center text-error-500 mb-4">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Sistem Mengalami Kendala
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {error.message || 'Terjadi masalah yang tidak terduga pada sistem. Silakan muat ulang halaman.'}
      </p>
      <Button onClick={() => reset()} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Muat Ulang Halaman
      </Button>
    </div>
  );
}
