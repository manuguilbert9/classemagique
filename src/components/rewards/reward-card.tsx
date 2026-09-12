'use client';

import type { ReactNode } from 'react';
import { Gem, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * La carte d'une récompense : un jeu ou un avantage à débloquer.
 *
 * Elle dit d'un coup d'œil trois choses que l'ancienne version laissait
 * deviner : ce que c'est, ce que ça coûte, et — quand l'élève ne peut pas
 * encore se l'offrir — combien de pépites il lui manque.
 */

interface RewardCardProps {
  title: string;
  description: string;
  /** L'illustration : une icône lucide ou un emoji. */
  visual: ReactNode;
  cost: number;
  nuggets: number;
  actionLabel?: string;
  onAction: () => void;
  /** Déjà acquis : la carte bascule en état « obtenu » et le bouton disparaît. */
  owned?: boolean;
  ownedLabel?: string;
  /** Habillage particulier (Ski on Neon a le sien). */
  className?: string;
  visualClassName?: string;
  buttonClassName?: string;
}

export function RewardCard({
  title,
  description,
  visual,
  cost,
  nuggets,
  actionLabel = 'Jouer',
  onAction,
  owned = false,
  ownedLabel = 'Déjà débloqué',
  className,
  visualClassName,
  buttonClassName,
}: RewardCardProps) {
  const manque = cost - nuggets;
  const abordable = manque <= 0;

  return (
    <article
      className={cn(
        'group flex w-full max-w-sm flex-col overflow-hidden rounded-[22px] border bg-card text-center shadow-sm transition-all duration-200',
        abordable && !owned && 'hover:-translate-y-1 hover:shadow-lg',
        !abordable && !owned && 'opacity-90',
        className
      )}
    >
      <div
        className={cn(
          'relative flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10',
          visualClassName
        )}
      >
        {/* L'illustration accepte aussi bien une icône lucide qu'un emoji. */}
        <span className="text-7xl leading-none [&>svg]:h-24 [&>svg]:w-24 [&>svg]:text-primary">{visual}</span>
        {/* Le prix, toujours visible sur l'illustration. */}
        {!owned && (
          <span
            className={cn(
              'absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-extrabold shadow-sm',
              abordable ? 'bg-amber-400 text-amber-950' : 'bg-muted text-muted-foreground'
            )}
          >
            {cost} <Gem className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="font-headline text-2xl leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="mt-auto pt-4">
          {owned ? (
            <p className="font-bold text-emerald-600">✓ {ownedLabel}</p>
          ) : abordable ? (
            <Button onClick={onAction} size="lg" className={cn('w-full text-lg', buttonClassName)}>
              {actionLabel}
            </Button>
          ) : (
            <div className="space-y-1.5">
              <Button disabled size="lg" className="w-full text-lg">
                <Lock className="mr-2 h-4 w-4" />
                {actionLabel}
              </Button>
              <p className="text-xs font-semibold text-muted-foreground">
                Encore {manque} pépite{manque > 1 ? 's' : ''} à gagner
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
