'use client';

import Link from 'next/link';
import { useCallback, useState, type ReactNode } from 'react';
import { Check, RefreshCw, RotateCcw, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreTube } from '@/components/score-tube';
import { cn } from '@/lib/utils';

/**
 * Le kit commun des écrans d'exercice.
 *
 * Chaque exercice réinventait sa barre de progression, son message de
 * correction et son écran de fin, avec à chaque fois des formulations, des
 * tailles et des couleurs différentes. Un enfant qui passe d'un exercice à
 * l'autre doit tout réapprendre. Ces trois briques fixent le vocabulaire :
 * où j'en suis, si c'est juste, et ce que je fais maintenant.
 */

/**
 * L'avancement dans la séance : un chapelet de pastilles plutôt qu'une barre.
 * Un enfant compte les points ; il ne lit pas un pourcentage.
 */
export function ExerciseProgress({
  current,
  total,
  /** Les résultats déjà connus, pour colorer les pastilles passées. */
  results = [],
  className,
}: {
  current: number;
  total: number;
  results?: Array<'correct' | 'corrected' | 'incorrect'>;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {Array.from({ length: total }, (_, index) => {
          const result = results[index];
          const estCourante = index === current;
          return (
            <span
              key={index}
              aria-hidden
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                estCourante ? 'w-7 bg-primary' : 'w-2.5',
                !estCourante && result === 'correct' && 'bg-emerald-500',
                // Trouvée après correction : ni tout à fait juste, ni ratée.
                !estCourante && result === 'corrected' && 'bg-amber-400',
                !estCourante && result === 'incorrect' && 'bg-red-400',
                !estCourante && !result && 'bg-muted-foreground/25'
              )}
            />
          );
        })}
      </div>
      <p className="text-sm font-bold text-muted-foreground" aria-live="polite">
        Question {Math.min(current + 1, total)} sur {total}
      </p>
    </div>
  );
}

/**
 * Les quatre choses qu'on peut avoir à dire à l'élève après une réponse.
 * `retry` est l'état neuf : ce n'est pas ça, mais la main lui revient.
 */
export type FeedbackStatus = 'correct' | 'corrected' | 'retry' | 'incorrect' | null;

/**
 * La correction : même forme, même couleur et même place pour tous les
 * exercices. En cas d'échec définitif la bonne réponse est toujours rappelée —
 * sans quoi l'élève repart sans savoir ce qu'il fallait répondre.
 */
export function AnswerFeedback({
  status,
  correctAnswer,
  /** L'aide est active : on le dit, sinon le halo sur la bonne réponse surprend. */
  hinted = false,
  children,
  className,
}: {
  status: FeedbackStatus;
  /** Ce qu'il fallait répondre, rappelé quand l'élève ne l'a pas trouvé. */
  correctAnswer?: ReactNode;
  hinted?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  if (!status) return null;

  const ton = {
    correct: {
      cadre: 'border-emerald-300 bg-emerald-50 text-emerald-700',
      pastille: 'bg-emerald-500',
      icone: <Check className="h-5 w-5" />,
      mot: 'Bravo, c’est juste !',
    },
    corrected: {
      cadre: 'border-emerald-300 bg-emerald-50 text-emerald-700',
      pastille: 'bg-amber-500',
      icone: <Check className="h-5 w-5" />,
      mot: 'C’est la bonne réponse. Tu t’es corrigé tout seul !',
    },
    retry: {
      cadre: 'border-amber-300 bg-amber-50 text-amber-800',
      pastille: 'bg-amber-500',
      icone: <RotateCcw className="h-5 w-5" />,
      mot: hinted ? 'Toujours pas. Regarde : la bonne réponse clignote.' : 'Ce n’est pas ça. Essaie encore !',
    },
    incorrect: {
      cadre: 'border-red-300 bg-red-50 text-red-700',
      pastille: 'bg-red-500',
      icone: <X className="h-5 w-5" />,
      mot: 'Ce n’est pas ça.',
    },
  }[status];

  return (
    <div
      role="status"
      aria-live="assertive"
      className={cn(
        'flex items-center justify-center gap-3 rounded-[20px] border-2 p-4 text-lg font-bold animate-in fade-in slide-in-from-bottom-2',
        ton.cadre,
        className
      )}
    >
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white', ton.pastille)}>
        {ton.icone}
      </span>
      <span className="text-left">
        {children ?? ton.mot}
        {status === 'incorrect' && correctAnswer !== undefined && (
          <span className="mt-0.5 block text-base font-semibold">
            La bonne réponse : <span className="font-extrabold">{correctAnswer}</span>
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * L'écran de fin : le score, un mot juste, et surtout deux sorties claires —
 * recommencer, ou revenir en classe. Beaucoup d'exercices laissaient l'élève
 * dans une impasse une fois terminés.
 */
export function ExerciseFinished({
  correct,
  total,
  /** Masque « Recommencer » (en mode devoirs, la séance ne se rejoue pas). */
  canRestart = true,
  onRestart,
  returnHref = '/en-classe',
  returnLabel = 'Retour en classe',
  children,
}: {
  correct: number;
  total: number;
  canRestart?: boolean;
  onRestart?: () => void;
  returnHref?: string;
  returnLabel?: string;
  children?: ReactNode;
}) {
  const score = total > 0 ? (correct / total) * 100 : 0;

  // Un mot d'encouragement proportionné : ni faux enthousiasme, ni sanction.
  const mot =
    score >= 90 ? 'Sans faute ou presque. Bravo !'
    : score >= 70 ? 'Du bon travail !'
    : score >= 40 ? 'C’est en train de rentrer.'
    : 'C’est difficile ? On recommence tranquillement.';

  return (
    <div className="mx-auto w-full max-w-lg rounded-[26px] border bg-card p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-7 w-7" />
      </span>
      <h2 className="font-headline text-3xl sm:text-4xl">Exercice terminé !</h2>

      <p className="mt-3 text-xl">
        <span className="font-extrabold text-primary">{correct}</span> bonne{correct > 1 ? 's' : ''} réponse
        {correct > 1 ? 's' : ''} sur <span className="font-extrabold">{total}</span>
      </p>
      <p className="mt-1 text-muted-foreground">{mot}</p>

      <div className="my-6">
        <ScoreTube score={score} />
      </div>

      {children}

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {canRestart && onRestart && (
          <Button onClick={onRestart} size="lg" className="text-lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Recommencer
          </Button>
        )}
        <Button asChild variant="outline" size="lg" className="text-lg">
          <Link href={returnHref}>{returnLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Le cadre d'une question : la consigne au-dessus, la question au centre,
 * toujours à la même place et à la même taille d'un exercice à l'autre.
 */
export function QuestionCard({
  instruction,
  children,
  className,
}: {
  instruction?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('relative rounded-[22px] border bg-card p-5 shadow-sm sm:p-7', className)}>
      {instruction && (
        <p className="mb-5 text-center font-exercise text-xl leading-snug text-muted-foreground sm:text-2xl">
          {instruction}
        </p>
      )}
      {children}
    </section>
  );
}

/**
 * Le droit à l'erreur.
 *
 * Quand l'élève se trompe, la plupart des exercices passaient aussitôt à la
 * question suivante : il n'écrivait jamais la bonne réponse, et ne la
 * mémorisait donc pas. Ce petit état lui rend la main autant de fois qu'il le
 * faut. Seule la première tentative compte pour le score ; à partir de la
 * deuxième erreur, la bonne réponse se signale discrètement pour qu'il ne
 * reste pas bloqué.
 *
 * À réserver aux exercices qui se déroulent au rythme de l'élève : dans un
 * entraînement chronométré, réessayer n'a pas de sens.
 */

/** Nombre d'erreurs à partir duquel on guide l'élève vers la bonne réponse. */
export const ERREURS_AVANT_AIDE = 2;

/**
 * Le temps pendant lequel la correction reste à l'écran avant que la main
 * revienne à l'élève. Trois secondes : le temps de lire le message et de
 * regarder à nouveau la question, sans que l'attente devienne pesante.
 */
export const DELAI_NOUVEL_ESSAI = 3000;

/** Le temps d'affichage d'une réussite avant de passer à la question suivante. */
export const DELAI_REUSSITE = 1500;

export interface SecondChance {
  /** Le nombre d'erreurs commises sur la question en cours. */
  errors: number;
  /** Les réponses déjà tentées et fausses, pour les marquer à l'écran. */
  wrongAnswers: string[];
  /** Faut-il désigner la bonne réponse ? (à partir de la deuxième erreur) */
  showHint: boolean;
  /** L'élève s'est-il déjà trompé sur cette question ? */
  hasFailed: boolean;
  /** Enregistre une erreur et rend la main pour un nouvel essai. */
  registerError: (answer?: string) => void;
  /** Le statut à retenir pour le score une fois la bonne réponse trouvée. */
  resultOnSuccess: () => 'correct' | 'corrected';
  /** À appeler au passage à la question suivante. */
  reset: () => void;
}

export function useSecondChance(): SecondChance {
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);

  const registerError = useCallback((answer?: string) => {
    setErrors((n) => n + 1);
    if (answer !== undefined) setWrongAnswers((prev) => (prev.includes(answer) ? prev : [...prev, answer]));
  }, []);

  const reset = useCallback(() => {
    setErrors(0);
    setWrongAnswers([]);
  }, []);

  const resultOnSuccess = useCallback((): 'correct' | 'corrected' => (errors > 0 ? 'corrected' : 'correct'), [errors]);

  return {
    errors,
    wrongAnswers,
    showHint: errors >= ERREURS_AVANT_AIDE,
    hasFailed: errors > 0,
    registerError,
    resultOnSuccess,
    reset,
  };
}

/**
 * La classe à poser sur la bonne réponse quand l'aide s'active : un halo qui
 * respire, assez visible pour guider, assez discret pour ne pas donner la
 * réponse avant que l'élève l'ait cherchée.
 */
export const HINT_CLASSES = 'animate-pulse ring-4 ring-amber-400 ring-offset-2';
