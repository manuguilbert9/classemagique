'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Le bandeau d'en-tête commun à tout le site.
 *
 * C'est la signature visuelle de Classe Magique, née de la page « En classe » :
 * un aplat dégradé du rose primaire au corail, deux bulles claires en
 * transparence pour la profondeur, une pastille d'icône, et les actions en
 * pilules à droite. Toutes les pages partagent ce bandeau pour que l'élève se
 * sente au même endroit d'un écran à l'autre.
 */

interface PageBannerProps {
  /** L'icône de la pastille, à gauche du titre. */
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Les pilules d'action, à droite (voir `PillLink` et `PillButton`). */
  actions?: ReactNode;
  /** Contenu libre sous le titre : compteur, filtre, fil d'ariane… */
  children?: ReactNode;
  className?: string;
}

export function PageBanner({ icon, title, subtitle, actions, children, className }: PageBannerProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-[26px] bg-gradient-to-r from-primary via-primary to-accent p-5 text-white shadow-lg shadow-primary/20 sm:p-6',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 left-[18%] h-36 w-36 rounded-full bg-white/10" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner [&>svg]:h-7 [&>svg]:w-7">
            {icon}
          </span>
          <div className="min-w-0">
            <h1 className="font-headline text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-white/90 sm:text-base">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {children && <div className="relative mt-4">{children}</div>}
    </header>
  );
}

interface PillProps {
  icon?: React.ComponentType<{ className?: string }>;
  children?: ReactNode;
  className?: string;
}

const pillClasses =
  'inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

/** Une pilule de navigation dans le bandeau. */
export function PillLink({ href, icon: Icon, children, className }: PillProps & { href: string }) {
  return (
    <Link href={href} className={cn(pillClasses, className)}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}

/** Une pilule d'action dans le bandeau, pour ce qui n'est pas un lien. */
export function PillButton({
  icon: Icon,
  children,
  className,
  onClick,
  ariaLabel,
}: PillProps & { onClick: () => void; ariaLabel?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cn(pillClasses, className)}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/**
 * La pilule ronde, pour une action sans libellé (messagerie, plein écran).
 * Même matière que les autres, format carré pour ne pas encombrer le bandeau.
 */
export function PillIcon({
  icon: Icon,
  onClick,
  ariaLabel,
  badge,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  ariaLabel: string;
  /** Pastille de notification, affichée en haut à droite quand elle est > 0. */
  badge?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white transition-all hover:-translate-y-0.5 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
        className
      )}
    >
      <Icon className="h-5 w-5" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
            {badge}
          </span>
        </span>
      )}
    </button>
  );
}

/**
 * Le bouton plein écran rhabillé aux couleurs du bandeau : il vient de
 * `FullscreenToggle`, qu'on enveloppe plutôt que de le dupliquer.
 */
export function PillSlot({ children }: { children: ReactNode }) {
  return (
    <span className="text-white [&_button]:h-10 [&_button]:w-10 [&_button]:rounded-full [&_button]:border [&_button]:border-white/25 [&_button]:bg-white/15 [&_button:hover]:bg-white/25 [&_svg]:text-white">
      {children}
    </span>
  );
}
