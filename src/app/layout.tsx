
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserContext, UserProvider } from '@/context/user-context';
import { useContext, useMemo } from 'react';
import { hexToHsl } from '@/lib/utils';
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
});


// Function to calculate luminance and determine if a color is light or dark
const getLuminance = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  // Perceived luminance formula
  return (0.299 * r + 0.587 * g + 0.114 * b);
};


// This component now needs to be a client component to access context
function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { student } = useContext(UserContext);

  const themeStyle = useMemo(() => {
    if (!student?.themeColors) return '';

    const { background, primary, accent } = student.themeColors;
    const bgHsl = hexToHsl(background);
    const [h, s, l] = bgHsl.split(' ').map(val => parseInt(val));

    const isDarkBackground = l < 50;
    
    const foreground = isDarkBackground ? '24 30% 95%' : '24 10% 20%';
    const cardForeground = isDarkBackground ? '24 30% 95%' : '24 10% 20%';
    const mutedForeground = isDarkBackground ? '24 30% 70%' : '24 10% 40%';
    
    // Make card background slightly lighter/darker than the main background
    const cardL = isDarkBackground ? l + 5 : l - 5;
    const cardBg = `${h} ${s}% ${Math.max(0, Math.min(100, cardL))}%`;

    return `
      :root {
        --background: ${bgHsl};
        --primary: ${hexToHsl(primary)};
        --accent: ${hexToHsl(accent)};
        --foreground: ${foreground};
        --card-foreground: ${cardForeground};
        --muted-foreground: ${mutedForeground};
        --card: ${cardBg};
        --popover: ${cardBg};
      }
    `;
  }, [student?.themeColors]);

  return (
    <html lang="fr" className={`${caveat.variable}`}>
      <head>
        <title>Classe Magique</title>
        <meta name="description" content="Des exercices amusants et engageants pour développer vos compétences !" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
        {themeStyle && <style>{themeStyle}</style>}
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <ThemedLayout>{children}</ThemedLayout>
    </UserProvider>
  );
}
