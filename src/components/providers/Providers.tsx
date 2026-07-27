'use client';

import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}
