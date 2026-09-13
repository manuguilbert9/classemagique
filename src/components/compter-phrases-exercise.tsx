'use client';

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Confetti from 'react-dom-confetti';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, type ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import type { TexteACompter } from '@/lib/exercise-content/compter-phrases';
import { getPooledContent } from '@/services/exercise-pool';
import type { SkillLevel } from '@/lib/skills';
import {
  AnswerFeedback,
  DELAI_NOUVEL_ESSAI,
  ExerciseFinished,
  ExerciseProgress,
  HINT_CLASSES,
  QuestionCard,
  useSecondChance,
  type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const SLUG = 'compter-phrases';

/** Cinq textes par séance : ils sont plus longs à lire qu'une question ordinaire. */
const NUM_QUESTIONS = 5;

/** Le temps de regarder la correction, qui découpe le texte phrase par phrase. */
const DELAI_LECTURE_CORRECTION = 4500;

/**
 * La ponctuation qui termine une phrase, éventuellement suivie du guillemet
 * fermant d'une parole rapportée (« … pages. »). Tout le reste — virgule,
 * point-virgule, deux-points, point d'abréviation — laisse la phrase ouverte.
 */
const PONCTUATION_FINALE = /([.!?…]+(?:\s*»)?)$/;

/** Sépare une phrase de son point final, pour pouvoir mettre celui-ci en valeur. */
function couperFinale(phrase: string): [string, string] {
  const trouve = phrase.match(PONCTUATION_FINALE);
  if (!trouve) return [phrase, ''];
  return [phrase.slice(0, phrase.length - trouve[1].length), trouve[1]];
}

/**
 * Les deux teintes qui alternent d'une phrase à l'autre pendant la correction.
 * C'est l'alternance, plus que la couleur, qui fait voir le découpage.
 */
const TEINTES_CORRECTION = [
  { fond: 'bg-sky-100 text-sky-950', pastille: 'bg-sky-500' },
  { fond: 'bg-violet-100 text-violet-950', pastille: 'bg-violet-500' },
];

/**
 * « Compter les phrases » : un texte, et une seule question — combien
 * contient-il de phrases ?
 *
 * Tout l'exercice tient dans ce que l'élève doit apprendre à ignorer. Les
 * virgules, les points-virgules, les deux-points et les points d'abréviation
 * découpent le texte sans le terminer ; les points de suspension, eux, le
 * terminent bel et bien. Les textes du corpus sont donc écrits pour tendre ces
 * pièges, de plus en plus nombreux du niveau B au niveau D.
 *
 * Deux aides, dans cet ordre :
 * - à la deuxième erreur, la ponctuation qui termine réellement une phrase
 *   s'allume dans le texte — c'est la règle qu'il faut retenir, pas la
 *   réponse ;
 * - une fois la réponse trouvée, le texte se rejoue découpé et numéroté,
 *   phrase par phrase.
 */
export function CompterPhrasesExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [level, setLevel] = useState<SkillLevel>('B');
  const [textes, setTextes] = useState<TexteACompter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackStatus>(null);
  const [choix, setChoix] = useState<number | null>(null);
  const secondChance = useSecondChance();
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

  useEffect(() => {
    if (student?.levels?.[SLUG]) setLevel(student.levels[SLUG]);
  }, [student]);

  // Les textes viennent du stock partagé : à niveau égal, toute la classe
  // compte les phrases des mêmes.
  const chargerTextes = useCallback(async () => {
    const tirage = await getPooledContent<TexteACompter>(SLUG, NUM_QUESTIONS, {
      settings: { level },
      studentId: student?.id ?? null,
    });
    setTextes(tirage);
  }, [level, student?.id]);

  useEffect(() => {
    chargerTextes();
  }, [chargerTextes]);

  const texte = textes[currentIndex];
  const resultats = useMemo(
    () => sessionDetails.map((d) => d.status as 'correct' | 'corrected' | 'incorrect'),
    [sessionDetails]
  );

  // La correction n'apparaît qu'une fois la bonne réponse donnée : la montrer
  // plus tôt reviendrait à compter les phrases à la place de l'élève.
  const enCorrection = feedback === 'correct' || feedback === 'corrected';

  const passerAuSuivant = useCallback(() => {
    setShowConfetti(false);
    setFeedback(null);
    setChoix(null);
    secondChance.reset();
    if (currentIndex < NUM_QUESTIONS - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, secondChance]);

  const repondre = (nombre: number) => {
    if (feedback || !texte) return;
    setChoix(nombre);

    // Faux : la main revient à l'élève, qui recompte. Rien n'est enregistré
    // tant qu'il n'a pas trouvé lui-même.
    if (nombre !== texte.reponse) {
      secondChance.registerError(String(nombre));
      setFeedback('retry');
      setTimeout(() => {
        setFeedback(null);
        setChoix(null);
      }, DELAI_NOUVEL_ESSAI);
      return;
    }

    const issue = secondChance.resultOnSuccess();
    const debut = texte.phrases[0];
    setSessionDetails((prev) => [
      ...prev,
      {
        question: `Combien de phrases ? « ${debut}… »`,
        userAnswer: String(nombre),
        correctAnswer: String(texte.reponse),
        status: issue,
      },
    ]);

    // Seule une réussite du premier coup rapporte un point.
    if (issue === 'correct') {
      setCorrectAnswers((n) => n + 1);
      setShowConfetti(true);
    }
    setFeedback(issue);
    // Plus long qu'ailleurs : le texte se rejoue découpé, il faut le relire.
    setTimeout(passerAuSuivant, DELAI_LECTURE_CORRECTION);
  };

  useEffect(() => {
    const enregistrer = async () => {
      if (!isFinished || !student || hasBeenSaved) return;
      setHasBeenSaved(true);
      const score = (correctAnswers / NUM_QUESTIONS) * 100;
      if (isHomework && homeworkDate) {
        await saveHomeworkResult({ userId: student.id, date: homeworkDate, skillSlug: SLUG, score });
      } else {
        await addScore({ userId: student.id, skill: SLUG, score, details: sessionDetails });
      }
    };
    enregistrer();
  }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

  const recommencer = async () => {
    await chargerTextes();
    setCurrentIndex(0);
    setFeedback(null);
    setChoix(null);
    setIsFinished(false);
    setCorrectAnswers(0);
    setHasBeenSaved(false);
    setSessionDetails([]);
    setShowConfetti(false);
  };

  if (!texte) {
    return <p className="p-8 text-center text-muted-foreground">Je prépare les textes…</p>;
  }

  if (isFinished) {
    return (
      <ExerciseFinished
        correct={correctAnswers}
        total={NUM_QUESTIONS}
        canRestart={!isHomework}
        onRestart={recommencer}
        returnHref={isHomework ? '/devoirs' : '/en-classe'}
        returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
      />
    );
  }

  const nombres = Array.from({ length: texte.choixMax }, (_, i) => i + 1);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-1">
      <ExerciseProgress current={currentIndex} total={NUM_QUESTIONS} results={resultats} />

      <QuestionCard instruction="Lis le texte, puis compte ses phrases.">
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <Confetti
            active={showConfetti}
            config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3, width: '10px', height: '10px' }}
          />
        </div>

        {/* Le texte. Pendant la correction, chaque phrase reprend sa place dans
            un cadre numéroté ; le reste du temps, il se lit d'un seul tenant. */}
        <p
          className={cn(
            'font-body text-xl leading-loose sm:text-2xl sm:leading-loose',
            enCorrection && 'leading-[2.6]'
          )}
        >
          {texte.phrases.map((phrase, index) => {
            const [corps, finale] = couperFinale(phrase);
            const teinte = TEINTES_CORRECTION[index % TEINTES_CORRECTION.length];

            if (enCorrection) {
              return (
                <span key={index} className={cn('mr-1.5 rounded-lg px-1.5 py-0.5', teinte.fond)}>
                  <span
                    className={cn(
                      'mr-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-white',
                      teinte.pastille
                    )}
                  >
                    {index + 1}
                  </span>
                  {phrase}
                </span>
              );
            }

            return (
              <span key={index}>
                {corps}
                {/* À la deuxième erreur, on allume ce qui termine vraiment une
                    phrase : c'est la règle à retenir, pas la réponse. */}
                <span
                  className={cn(
                    secondChance.showHint && 'rounded bg-amber-300 px-1 font-bold text-amber-950 ring-2 ring-amber-400'
                  )}
                >
                  {finale}
                </span>{' '}
              </span>
            );
          })}
        </p>
      </QuestionCard>

      <section className="rounded-[22px] border bg-card p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-center font-exercise text-lg text-muted-foreground sm:text-xl">
          Combien y a-t-il de phrases dans ce texte ?
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {nombres.map((nombre) => {
            const estLaBonne = nombre === texte.reponse;
            const estMonChoix = nombre === choix;
            const dejaEssaye = secondChance.wrongAnswers.includes(String(nombre));
            return (
              <Button
                key={nombre}
                variant="outline"
                onClick={() => repondre(nombre)}
                disabled={!!feedback}
                className={cn(
                  'h-16 w-16 justify-center p-0 text-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-100 sm:h-[4.5rem] sm:w-[4.5rem] sm:text-3xl',
                  enCorrection && estLaBonne && 'border-emerald-600 bg-emerald-500 text-white',
                  feedback === 'retry' && estMonChoix && 'border-red-600 bg-red-500 text-white',
                  dejaEssaye && !feedback && 'opacity-40 line-through',
                  secondChance.showHint && !feedback && estLaBonne && HINT_CLASSES
                )}
              >
                {nombre}
              </Button>
            );
          })}
        </div>
      </section>

      <AnswerFeedback status={feedback} hinted={secondChance.showHint} correctAnswer={texte.reponse}>
        {enCorrection
          ? `${texte.reponse} phrases : les voici, une couleur pour chacune.`
          : secondChance.showHint
            ? 'Recompte : les signes allumés sont ceux qui terminent une phrase.'
            : 'Ce n’est pas le bon compte. Recompte tranquillement !'}
      </AnswerFeedback>

      {/* Le rappel de la règle, discret mais toujours là : c'est elle qu'on
          travaille, l'exercice n'est qu'un prétexte à l'appliquer. */}
      <p className="px-2 text-center text-sm text-muted-foreground">
        Une phrase commence par une <strong>majuscule</strong> et se termine par un <strong>point</strong>, un{' '}
        <strong>point d’exclamation&nbsp;!</strong>, un <strong>point d’interrogation&nbsp;?</strong> ou des{' '}
        <strong>points de suspension…</strong> La virgule, le point-virgule et les deux-points, eux, ne terminent
        rien du tout.
      </p>
    </div>
  );
}
