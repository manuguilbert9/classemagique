'use client';

import Link from 'next/link';
import { Home, Loader2, LogIn } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Les deux écrans transitoires que toutes les pages partagent : le chargement
 * et l'élève non connecté. Ils étaient réécrits page par page, avec un aspect
 * différent à chaque fois ; les voici une bonne fois pour toutes.
 */

/** Le chargement : une seule roue, centrée, avec un mot sur ce qu'on attend. */
export function PageLoading({ children = 'Un instant…' }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
      </span>
      <p className="mt-4 text-muted-foreground">{children}</p>
    </div>
  );
}

/** L'élève n'est pas connecté : on le dit simplement, et on le ramène. */
export function NotConnected({ children = 'Connecte-toi pour retrouver ton travail.' }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[26px] border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LogIn className="h-7 w-7" />
        </span>
        <h2 className="font-headline text-2xl">Tu n&apos;es pas connecté</h2>
        <p className="mt-2 text-muted-foreground">{children}</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
