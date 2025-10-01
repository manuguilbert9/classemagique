
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/context/user-context';
import { ChatProvider } from '@/context/chat-context';
import localFont from 'next/font/local';

// Chargement des polices personnalisées
const andika = localFont({
  src: '../../public/fonts/andika.ttf',
  variable: '--font-andika',
  display: 'swap',
});

const monof = localFont({
  src: '../../public/fonts/monof55.ttf',
  variable: '--font-monof',
  display: 'swap',
});

const scolarPaper = localFont({
  src: '../../public/fonts/scolarpaper.ttf',
  variable: '--font-scolar-paper',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <ChatProvider>
        <html lang="fr" className={`${andika.variable} ${monof.variable} ${scolarPaper.variable}`}>
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
