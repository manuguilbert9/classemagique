import './globals.css';
import { ClientProviders } from '@/components/client-providers';
import localFont from 'next/font/local';
import type { Metadata } from 'next';

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

export const metadata: Metadata = {
  title: 'Classe Magique',
  description: 'Des exercices amusants et engageants pour développer vos compétences !',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${andika.variable} ${monof.variable} ${scolarPaper.variable}`}>
      <body className="font-body antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
