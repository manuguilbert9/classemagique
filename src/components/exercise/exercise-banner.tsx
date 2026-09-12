'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Skill } from '@/lib/skills';
import { categoryStyles } from '@/lib/skills';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { cn } from '@/lib/utils';

/**
 * L'en-tête de tous les écrans d'exercice.
 *
 * Même forme que le bandeau du site — arrondi généreux, pastille d'icône,
 * actions en pilules — mais teinté à la couleur de la matière : l'élève sait
 * en un coup d'œil s'il est en français ou en mathématiques, et il retrouve
 * toujours le retour au même endroit.
 */
export function ExerciseBanner({ skill, returnHref }: { skill: Skill; returnHref: string }) {
  const style = categoryStyles[skill.category];

  return (
    <header className={cn('relative overflow-hidden rounded-[26px] p-4 shadow-sm sm:p-5', style.bg, style.text)}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/30" />
      <div className="pointer-events-none absolute -bottom-16 left-[22%] h-32 w-32 rounded-full bg-white/20" />

      <div className="relative flex items-center gap-3">
        <Link
          href={returnHref}
          aria-label="Revenir en arrière"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 hover:bg-white sm:px-3.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour</span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/60 shadow-inner [&>svg]:h-7 [&>svg]:w-7 sm:h-14 sm:w-14 sm:[&>svg]:h-8 sm:[&>svg]:w-8">
            {skill.icon}
          </span>
          <div className="min-w-0 text-center sm:text-left">
            <h1 className="truncate font-exercise text-2xl leading-tight sm:text-4xl">{skill.name}</h1>
            {/* La matière : le repère de couleur, écrit en toutes lettres. */}
            <p className="text-[11px] font-extrabold uppercase tracking-wide opacity-70 sm:text-xs">{skill.category}</p>
          </div>
        </div>

        <span className="shrink-0 [&_button]:h-10 [&_button]:w-10 [&_button]:rounded-full [&_button]:border [&_button]:border-black/10 [&_button]:bg-white/70 [&_button:hover]:bg-white">
          <FullscreenToggle />
        </span>
      </div>
    </header>
  );
}
