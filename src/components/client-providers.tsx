'use client';

import { UserProvider } from '@/context/user-context';
import { ChatProvider } from '@/context/chat-context';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/context/theme-context';

import { SnowEffect } from '@/components/theme/snow-effect';
import { ChristmasDecorations } from '@/components/theme/christmas-decorations';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SnowEffect />
        <ChristmasDecorations />
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
