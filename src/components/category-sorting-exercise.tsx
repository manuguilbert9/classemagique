
'use client';

import { useState, useCallback, useContext, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RefreshCw, Star } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';

// ========================
// DATA
// ========================

import {
  CATEGORY_SETS,
  NUM_ITEMS,
  type CategorySet,
  type GameItem,
  type SeanceDeTri,
} from '@/lib/exercise-content/tri-categories';
import { getPooledContent } from '@/services/exercise-pool';
import {
  AnswerFeedback,
  DELAI_NOUVEL_ESSAI,
  ExerciseFinished,
  ExerciseProgress,
  useSecondChance,
  type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

// ========================
// COMPONENT
// ========================

export function CategorySortingExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [categorySet, setCategorySet] = useState<CategorySet>(CATEGORY_SETS[0]);
  const [items, setItems] = useState<GameItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackStatus>(null);
  // Le droit à l'erreur : l'élève rejoue jusqu'à trouver la bonne catégorie.
  const secondChance = useSecondChance();
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

  // La séance vient du stock partagé : même collection et mêmes objets pour tous.
  const loadSeance = useCallback(async () => {
    const [seance] = await getPooledContent<SeanceDeTri>('category-sorting', 1, {
      studentId: student?.id ?? null,
    });
    if (!seance) return;
    setCategorySet(CATEGORY_SETS.find((s) => s.id === seance.setId) ?? CATEGORY_SETS[0]);
    setItems(seance.items);
  }, [student?.id]);

  useEffect(() => {
    loadSeance();
  }, [loadSeance]);

  const currentItem = items[currentIndex];

  const handleChoice = useCallback(
    (choice: 1 | 2) => {
      if (feedback || !currentItem) return;

      const isCorrect = choice === currentItem.correctCategory;
      const chosenCategory = choice === 1 ? categorySet.category1 : categorySet.category2;
      const correctCategory =
        currentItem.correctCategory === 1 ? categorySet.category1 : categorySet.category2;

      // Faux : la main revient à l'élève, et rien n'est consigné tant qu'il
      // n'a pas rangé l'objet dans la bonne catégorie.
      if (!isCorrect) {
        secondChance.registerError(chosenCategory.name);
        setFeedback('retry');
        setTimeout(() => setFeedback(null), DELAI_NOUVEL_ESSAI);
        return;
      }

      const issue = secondChance.resultOnSuccess();
      setSessionDetails(prev => [
        ...prev,
        {
          question: currentItem.emoji,
          userAnswer: chosenCategory.name,
          correctAnswer: correctCategory.name,
          status: issue,
        },
      ]);

      // Seule une réussite du premier coup rapporte un point.
      if (issue === 'correct') {
        setCorrectAnswers(prev => prev + 1);
        setShowConfetti(true);
      }
      setFeedback(issue);
      setTimeout(() => {
        setShowConfetti(false);
        setFeedback(null);
        secondChance.reset();
        if (currentIndex >= NUM_ITEMS - 1) {
          setIsFinished(true);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, 900);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feedback, currentItem, categorySet, currentIndex]
  );

  useEffect(() => {
    const saveResult = async () => {
      if (isFinished && student && !hasBeenSaved) {
        setHasBeenSaved(true);
        const score = (correctAnswers / NUM_ITEMS) * 100;
        if (isHomework && homeworkDate) {
          await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: 'category-sorting',
            score,
          });
        } else {
          await addScore({
            userId: student.id,
            skill: 'category-sorting',
            score,
            details: sessionDetails,
          });
        }
      }
    };
    saveResult();
  }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

  const restart = async () => {
    await loadSeance();
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setFeedback(null);
    setIsFinished(false);
    setShowConfetti(false);
    setHasBeenSaved(false);
    setSessionDetails([]);
  };

  // ========================
  // FINISH SCREEN
  // ========================

  if (isFinished) {
    return (
      <ExerciseFinished
        correct={correctAnswers}
        total={NUM_ITEMS}
        canRestart={!isHomework}
        onRestart={restart}
        returnHref={isHomework ? '/devoirs' : '/en-classe'}
        returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
      />
    );
  }

  if (!currentItem) return null;

  // ========================
  // MAIN EXERCISE
  // ========================

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 p-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <ExerciseProgress
          current={currentIndex}
          total={NUM_ITEMS}
          results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')}
          className="flex-1"
        />
        <span className="text-muted-foreground font-medium tabular-nums text-lg">
          {currentIndex + 1}/{NUM_ITEMS}
        </span>
      </div>

      {/* Item card */}
      <Card
        className={cn(
          'w-full shadow-xl transition-all duration-300 border-4',
          (feedback === 'correct' || feedback === 'corrected') && 'bg-green-50 border-green-400',
          feedback === 'retry' && 'bg-red-50 border-red-400 animate-shake',
          !feedback && 'bg-card border-transparent'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-10 gap-4 min-h-[220px]">
          <p className="text-lg font-medium text-muted-foreground">Où va ceci ?</p>
          <div
            className="select-none leading-none"
            style={{ fontSize: '9rem' }}
            aria-label={currentItem.emoji}
          >
            {currentItem.emoji}
          </div>
          <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full" />
          {/* Après deux erreurs, on nomme la bonne catégorie. */}
          {secondChance.showHint && !feedback && (
            <p className="rounded-[16px] border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 font-bold text-amber-700">
              Range-le dans « {currentItem.correctCategory === 1 ? categorySet.category1.name : categorySet.category2.name} ».
            </p>
          )}
        </CardContent>
      </Card>

      {/* Confetti burst */}
      <div className="flex justify-center h-0 overflow-visible">
        <Confetti
          active={showConfetti}
          config={{ angle: 90, spread: 360, startVelocity: 35, elementCount: 70, dragFriction: 0.12, duration: 1500 }}
        />
      </div>

      {/* Category buttons */}
      <div className="grid grid-cols-2 gap-4">
        {([1, 2] as const).map(cat => {
          const category = cat === 1 ? categorySet.category1 : categorySet.category2;
          return (
            <button
              key={cat}
              onClick={() => handleChoice(cat)}
              disabled={!!feedback}
              className={cn(
                'rounded-2xl border-4 p-5 flex flex-col items-center gap-3',
                'transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary',
                'min-h-[140px] justify-center',
                category.bgClass,
                category.textClass,
                category.borderClass
              )}
              aria-label={category.name}
            >
              <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>{category.emoji}</span>
              <span className="text-2xl font-bold">{category.name}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
