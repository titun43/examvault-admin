'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Admin panel is hardcoded dark (bg-slate-900 everywhere). Force the dark
          theme on <html> so CSS variables resolve to dark values and all inherited
          text/buttons/inputs render correctly. Without this, defaultTheme="light"
          leaves <html> without the `dark` class → --foreground = black → invisible
          text on the dark slate backgrounds. */}
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
