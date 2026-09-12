'use client';

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, RefreshCw, Volume2, X } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, type ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from '@/components/score-tube';
import { VirtualKeyboard } from '@/components/virtual-keyboard';
import { avecDe } from '@/lib/elision';
import type { Manche } from '@/lib/exercise-content/comptage';
import { getPooledContent } from '@/services/exercise-pool';
import {
  AnswerFeedback,
  DELAI_NOUVEL_ESSAI,
  ExerciseFinished,
  ExerciseProgress,
  useSecondChance,
  type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const NOMBRE_DE_MANCHES = 10;

export function ComptagePointageExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [manches, setManches] = useState<Manche[]>([]);
  const [index, setIndex] = useState(0);
  const [pointes, setPointes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<FeedbackStatus>(null);
  // Le droit à l'erreur : l'élève recompte jusqu'à trouver, et seule la
  // première tentative compte pour le score.
  const secondChance = useSecondChance();
  const [reponseSaisie, setReponseSaisie] = useState<string | null>(null);
  const [bonnesReponses, setBonnesReponses] = useState(0);
  const [details, setDetails] = useState<ScoreDetail[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  useEffect(() => {
    const loadManches = async () => {
      setManches(await getPooledContent<Manche>('comptage-pointage', NOMBRE_DE_MANCHES, {
        studentId: student?.id ?? null,
      }));
    };
    loadManches();
  }, [student?.id]);

  const manche = manches[index];

  const dire = useCallback((texte: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  }, []);

  const consigne = useMemo(
    () => (manche ? `Combien y a-t-il ${avecDe(manche.nom)} ?` : ''),
    [manche]
  );

  useEffect(() => {
    if (consigne) dire(consigne);
  }, [consigne, dire]);

  /* --------------------------- Pointage des objets -------------------------- */

  const pointer = (i: number) => {
    if (feedback) return;
    setPointes((prev) => (prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i]));
  };

  /* ----------------------------- Réponse chiffrée --------------------------- */

  const repondre = useCallback(
    (chiffre: string) => {
      if (!manche || feedback) return;
      setReponseSaisie(chiffre);

      // Faux : on efface la saisie et l'élève recompte. Les pointages restent
      // à l'écran, ils sont justement là pour l'aider à recompter.
      if (Number(chiffre) !== manche.quantite) {
        secondChance.registerError(chiffre);
        setFeedback('retry');
        setTimeout(() => {
          setFeedback(null);
          setReponseSaisie(null);
        }, DELAI_NOUVEL_ESSAI);
        return;
      }

      const issue = secondChance.resultOnSuccess();
      setFeedback(issue);
      // Seule une réussite du premier coup rapporte un point.
      if (issue === 'correct') setBonnesReponses((n) => n + 1);

      setDetails((prev) => [
        ...prev,
        {
          question: `Combien y a-t-il ${avecDe(manche.nom)} ? (${manche.quantite} ${manche.emoji})`,
          userAnswer: chiffre,
          correctAnswer: String(manche.quantite),
          status: issue,
        },
      ]);

      setTimeout(() => {
        setFeedback(null);
        setReponseSaisie(null);
        setPointes([]);
        secondChance.reset();
        if (index < NOMBRE_DE_MANCHES - 1) {
          setIndex((i) => i + 1);
        } else {
          setIsFinished(true);
        }
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manche, feedback, index]
  );

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) repondre(e.key);
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [repondre]);

  /* -------------------------------- Résultat -------------------------------- */

  const score = Math.round((bonnesReponses / NOMBRE_DE_MANCHES) * 100);

  useEffect(() => {
    async function enregistrer() {
      if (!isFinished || !student || hasBeenSaved) return;
      setHasBeenSaved(true);
      try {
        if (isHomework && homeworkDate) {
          await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: 'comptage-pointage',
            score,
          });
        } else {
          await addScore({ userId: student.id, skill: 'comptage-pointage', score, details });
        }
      } catch (error) {
        console.error('Enregistrement du comptage impossible :', error);
      }
    }
    enregistrer();
  }, [isFinished, student, hasBeenSaved, score, details, isHomework, homeworkDate]);

  const recommencer = async () => {
    setManches(await getPooledContent<Manche>('comptage-pointage', NOMBRE_DE_MANCHES, {
      studentId: student?.id ?? null,
    }));
    setIndex(0);
    setPointes([]);
    setFeedback(null);
    setReponseSaisie(null);
    setBonnesReponses(0);
    setDetails([]);
    setIsFinished(false);
    setHasBeenSaved(false);
  };

  /* --------------------------------- Rendus --------------------------------- */

  if (isFinished) {
    return (
      <ExerciseFinished
        correct={bonnesReponses}
        total={NOMBRE_DE_MANCHES}
        canRestart={!isHomework}
        onRestart={recommencer}
        returnHref={isHomework ? '/devoirs' : '/en-classe'}
        returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
      />
    );
  }

  if (!manche) {
    return (
      <Card className="w-full max-w-lg mx-auto p-8 text-center text-muted-foreground">
        Préparation de l&apos;exercice...
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <ExerciseProgress
        current={index}
        total={NOMBRE_DE_MANCHES}
        results={details.map((d) => d.status as 'correct' | 'corrected' | 'incorrect')}
      />

      <Card className="shadow-2xl relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <Confetti
            active={(feedback === 'correct' || feedback === 'corrected')}
            config={{
              angle: 90,
              spread: 360,
              startVelocity: 40,
              elementCount: 100,
              dragFriction: 0.12,
              duration: 2000,
              stagger: 3,
              width: '10px',
              height: '10px',
            }}
          />
        </div>

        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl flex items-center justify-center gap-3">
            {consigne}
            <Button variant="ghost" size="icon" onClick={() => dire(consigne)}>
              <Volume2 className="h-7 w-7 text-muted-foreground" />
            </Button>
          </CardTitle>
          <p className="text-muted-foreground">Touche chaque objet pour le compter.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Le cadre de comptage : un objet pointé porte son rang. */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-muted/40 rounded-xl border-2 border-dashed">
            {manche.positions.map((position, i) => {
              const rang = pointes.indexOf(i);
              const estPointe = rang !== -1;
              return (
                <button
                  key={i}
                  onClick={() => pointer(i)}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200',
                    'text-4xl sm:text-6xl p-2 hover:scale-110 active:scale-95',
                    estPointe && 'bg-primary/15 ring-4 ring-primary'
                  )}
                  aria-label={estPointe ? `Objet compté, numéro ${rang + 1}` : 'Objet à compter'}
                >
                  <span className={cn(estPointe && 'opacity-60')}>{manche.emoji}</span>
                  {estPointe && (
                    <span className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold font-numbers">
                      {rang + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* La réponse */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                'relative w-40 h-20 border-2 rounded-lg flex items-center justify-center',
                (feedback === 'correct' || feedback === 'corrected') && 'border-green-500 bg-green-50',
                feedback === 'retry' && 'border-red-500 bg-red-50'
              )}
            >
              <span className="font-bold text-5xl font-numbers">{reponseSaisie ?? ''}</span>
              {(feedback === 'correct' || feedback === 'corrected') && (
                <Check className="absolute right-2 top-2 h-6 w-6 text-green-500" />
              )}
              {feedback === 'retry' && (
                <X className="absolute right-2 top-2 h-6 w-6 text-red-500" />
              )}
              {!feedback && (
                <span className="absolute bottom-1 text-muted-foreground text-xs">
                  Combien en tout ?
                </span>
              )}
            </div>
            <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full" />
            {/* On ne donne la quantité qu'au bout de deux comptages ratés. */}
            {secondChance.showHint && !feedback && (
              <p className="rounded-[16px] border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-lg font-bold text-amber-700">
                Il y a {manche.quantite} {manche.nom}.
              </p>
            )}
            <VirtualKeyboard onKeyPress={(touche) => touche !== '⌫' && repondre(touche)} numericOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
