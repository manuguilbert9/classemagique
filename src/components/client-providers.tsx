'use client';

import { UserProvider } from '@/context/user-context';
import { ChatProvider } from '@/context/chat-context';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/context/theme-context';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <ChatProvider>
            {children}
            <Toaster />
          </ChatProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
