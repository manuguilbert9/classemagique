'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Les intertitres du site, repris de la page « En classe ».
 *
 * Deux niveaux seulement, pour que la hiérarchie reste lisible par un enfant :
 * l'étiquette en petites capitales colorées (ce que c'est), et le titre de
 * section en police d'affichage (ce qu'on y fait).
 */

/** L'étiquette en petites capitales, avec son icône. */
export function SectionLabel({
  icon,
  children,
  className,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-primary [&>svg]:h-3.5 [&>svg]:w-3.5',
        className
      )}
    >
      {icon}
      {children}
    </div>
  );
}

/** Le titre de section, avec sa précision alignée à droite. */
export function SectionHeading({
  children,
  hint,
  className,
}: {
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-3.5 flex flex-wrap items-baseline justify-between gap-2', className)}>
      <h2 className="font-headline text-2xl font-bold">{children}</h2>
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
    </div>
  );
}

/**
 * L'état vide : une carte en pointillés, une icône, un mot d'encouragement.
 * Jamais une page blanche — l'élève doit toujours savoir quoi faire ensuite.
 */
export function EmptyState({
  icon,
  title,
  children,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto max-w-2xl rounded-[20px] border-2 border-dashed bg-card p-8 text-center [&>svg]:mx-auto [&>svg]:mb-3 [&>svg]:h-8 [&>svg]:w-8 [&>svg]:text-primary',
        className
      )}
    >
      {icon}
      <h3 className="font-headline text-xl">{title}</h3>
      {children && <div className="mt-1.5 text-muted-foreground">{children}</div>}
    </div>
  );
}

/**
 * Le gabarit de page : même largeur, même respiration et même rythme vertical
 * partout, pour que la navigation d'une page à l'autre ne « saute » pas.
 */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn('container mx-auto max-w-6xl px-4 py-6 sm:py-8', className)}>
      <div className="flex flex-col gap-8">{children}</div>
    </main>
  );
}
