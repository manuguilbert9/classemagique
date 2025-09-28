
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/context/user-context';
import { ChatProvider } from '@/context/chat-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <ChatProvider>
        <html lang="fr">
          <head>
            <title>Classe Magique</title>
            <meta name="description" content="Des exercices amusants et engageants pour développer vos compétences !" />
          </head>
          <body className="font-body antialiased">
            {children}
            <Toaster />
          </body>
        </html>
      </ChatProvider>
    </UserProvider>
  );
}
