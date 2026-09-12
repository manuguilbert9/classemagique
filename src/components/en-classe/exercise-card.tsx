'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { categoryAccents, type Skill } from '@/lib/skills';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
    skill: Skill;
    done?: boolean;
    /** hero : grande card "Aujourd'hui", avec description. compact : petite card de l'explorateur, icône + titre seulement. */
    variant?: 'hero' | 'compact';
}

/**
 * La card d'exercice commune à "Aujourd'hui" et à l'explorateur : icône vedette dans une
 * pastille colorée, carte claire avec un liseré de couleur (matière) en haut. Une fois
 * l'exercice fait aujourd'hui, la pastille se remplit et une coche apparaît.
 */
export function ExerciseCard({ skill, done = false, variant = 'hero' }: ExerciseCardProps) {
    const accent = categoryAccents[skill.category];
    const isHero = variant === 'hero';

    return (
        <Link
            href={`/exercise/${skill.slug}`}
            aria-label={`Pratiquer ${skill.name}`}
            className={cn(
                'group relative flex flex-col items-center gap-2 rounded-[20px] border border-border bg-card text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
                'border-t-4',
                accent.border,
                isHero ? 'p-5' : 'p-3.5'
            )}
        >
            <span className="relative inline-flex">
                <span
                    className={cn(
                        'flex items-center justify-center rounded-full transition-colors duration-200',
                        isHero ? 'h-16 w-16 [&>svg]:h-8 [&>svg]:w-8' : 'h-11 w-11 [&>svg]:h-5 [&>svg]:w-5',
                        done ? cn(accent.doneBg, 'text-white') : cn(accent.iconBg, accent.iconText)
                    )}
                >
                    {skill.icon}
                </span>
                {done && (
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-emerald-500 text-white">
                        <CheckCircle className="h-3.5 w-3.5" />
                    </span>
                )}
            </span>

            <h3 className={cn('font-exercise leading-tight', isHero ? 'text-xl' : 'text-sm font-semibold text-foreground')}>
                {skill.name}
            </h3>

            {isHero && (
                <p className="text-xs leading-snug text-muted-foreground line-clamp-2">{skill.description}</p>
            )}

            {isHero && done && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle className="h-3 w-3" /> Fait aujourd&apos;hui
                </span>
            )}
        </Link>
    );
}

interface ToolTileProps {
    skill: Skill;
}

/**
 * La tuile "Outil libre" : forme distincte des cards d'exercice (bordure en pointillés,
 * badge "Outil libre") pour bien signifier que ce n'est pas noté et toujours accessible.
 */
export function ToolTile({ skill }: ToolTileProps) {
    return (
        <Link
            href={`/exercise/${skill.slug}`}
            aria-label={`Ouvrir l'outil ${skill.name}`}
            className="group flex flex-1 basis-[320px] items-center gap-4 rounded-[22px] border-2 border-dashed border-sky-300 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:max-w-[520px]"
        >
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-md [&>svg]:h-6 [&>svg]:w-6">
                {skill.icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className="mb-1 inline-block rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    Outil libre
                </span>
                <h3 className="font-exercise text-lg font-bold leading-tight text-foreground">{skill.name}</h3>
                <p className="text-xs leading-snug text-muted-foreground">{skill.description}</p>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
            </span>
        </Link>
    );
}
