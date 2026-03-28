
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

interface Category {
  name: string;
  emoji: string;
  items: string[];
  bgClass: string;
  textClass: string;
  borderClass: string;
}

interface CategorySet {
  id: string;
  category1: Category;
  category2: Category;
}

const CATEGORY_SETS: CategorySet[] = [
  {
    id: 'animals-vehicles',
    category1: {
      name: 'Animaux',
      emoji: '🐾',
      items: ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧'],
      bgClass: 'bg-green-100 hover:bg-green-200',
      textClass: 'text-green-800',
      borderClass: 'border-green-400',
    },
    category2: {
      name: 'Véhicules',
      emoji: '🚗',
      items: ['🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚚', '🛵', '✈️', '🚀', '🚁', '⛵', '🚂', '🚜'],
      bgClass: 'bg-blue-100 hover:bg-blue-200',
      textClass: 'text-blue-800',
      borderClass: 'border-blue-400',
    },
  },
  {
    id: 'fruits-clothes',
    category1: {
      name: 'Fruits',
      emoji: '🍓',
      items: ['🍎', '🍌', '🍇', '🍑', '🍒', '🍉', '🥭', '🍊', '🍋', '🍐', '🍏', '🍈', '🫐', '🍅', '🥝'],
      bgClass: 'bg-orange-100 hover:bg-orange-200',
      textClass: 'text-orange-800',
      borderClass: 'border-orange-400',
    },
    category2: {
      name: 'Vêtements',
      emoji: '👕',
      items: ['👖', '🧣', '🧤', '🧦', '👗', '🧥', '👔', '👒', '🎩', '👟', '👠', '🧢', '🩱', '🥾', '🩳'],
      bgClass: 'bg-purple-100 hover:bg-purple-200',
      textClass: 'text-purple-800',
      borderClass: 'border-purple-400',
    },
  },
  {
    id: 'sea-savanna',
    category1: {
      name: 'Mer',
      emoji: '🌊',
      items: ['🐠', '🦈', '🐬', '🐋', '🦑', '🦞', '🦀', '🐡', '🦭', '🐙', '🦐', '🐚', '🐟', '🦟', '🐊'],
      bgClass: 'bg-cyan-100 hover:bg-cyan-200',
      textClass: 'text-cyan-800',
      borderClass: 'border-cyan-400',
    },
    category2: {
      name: 'Savane',
      emoji: '🌿',
      items: ['🦁', '🐘', '🦒', '🦓', '🐆', '🦏', '🐪', '🦛', '🦍', '🦜', '🦘', '🐃', '🦌', '🐆', '🦬'],
      bgClass: 'bg-amber-100 hover:bg-amber-200',
      textClass: 'text-amber-800',
      borderClass: 'border-amber-400',
    },
  },
  {
    id: 'food-sports',
    category1: {
      name: 'Nourriture',
      emoji: '🍽️',
      items: ['🍕', '🍔', '🌮', '🍣', '🍜', '🍞', '🧁', '🍰', '🍦', '🥐', '🧇', '🥞', '🥗', '🍲', '🥙'],
      bgClass: 'bg-red-100 hover:bg-red-200',
      textClass: 'text-red-800',
      borderClass: 'border-red-400',
    },
    category2: {
      name: 'Sports',
      emoji: '⚽',
      items: ['🏀', '🎮', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🎣', '🏹', '🛹', '🎽'],
      bgClass: 'bg-indigo-100 hover:bg-indigo-200',
      textClass: 'text-indigo-800',
      borderClass: 'border-indigo-400',
    },
  },
];

const NUM_ITEMS = 10;

// ========================
// HELPERS
// ========================

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface GameItem {
  emoji: string;
  correctCategory: 1 | 2;
}

function buildGameData(set: CategorySet): GameItem[] {
  const half = NUM_ITEMS / 2;
  const items1 = shuffle(set.category1.items).slice(0, half).map(e => ({ emoji: e, correctCategory: 1 as const }));
  const items2 = shuffle(set.category2.items).slice(0, half).map(e => ({ emoji: e, correctCategory: 2 as const }));
  return shuffle([...items1, ...items2]);
}

function pickRandomSet(): CategorySet {
  return CATEGORY_SETS[Math.floor(Math.random() * CATEGORY_SETS.length)];
}

// ========================
// COMPONENT
// ========================

export function CategorySortingExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [categorySet, setCategorySet] = useState<CategorySet>(pickRandomSet);
  const [items, setItems] = useState<GameItem[]>(() => buildGameData(pickRandomSet()));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

  // Keep categorySet and items in sync on first render
  useEffect(() => {
    const set = pickRandomSet();
    setCategorySet(set);
    setItems(buildGameData(set));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentItem = items[currentIndex];

  const handleChoice = useCallback(
    (choice: 1 | 2) => {
      if (feedback || !currentItem) return;

      const isCorrect = choice === currentItem.correctCategory;
      const chosenCategory = choice === 1 ? categorySet.category1 : categorySet.category2;
      const correctCategory =
        currentItem.correctCategory === 1 ? categorySet.category1 : categorySet.category2;

      setSessionDetails(prev => [
        ...prev,
        {
          question: currentItem.emoji,
          userAnswer: chosenCategory.name,
          correctAnswer: correctCategory.name,
          status: isCorrect ? 'correct' : 'incorrect',
        },
      ]);

      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
        setFeedback('correct');
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setFeedback(null);
          if (currentIndex >= NUM_ITEMS - 1) {
            setIsFinished(true);
          } else {
            setCurrentIndex(currentIndex + 1);
          }
        }, 900);
      } else {
        setFeedback('incorrect');
        setTimeout(() => setFeedback(null), 700);
      }
    },
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

  const restart = () => {
    const newSet = pickRandomSet();
    setCategorySet(newSet);
    setItems(buildGameData(newSet));
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
    const score = (correctAnswers / NUM_ITEMS) * 100;
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <Confetti
            active={true}
            config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 120, dragFriction: 0.12, duration: 3000, stagger: 3 }}
          />
        </div>
        <Star className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
        <h1 className="font-headline text-4xl mb-3">Bravo !</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Tu as réussi{' '}
          <span className="font-bold text-primary">{correctAnswers}</span> sur{' '}
          <span className="font-bold">{NUM_ITEMS}</span>
        </p>
        <ScoreTube score={score} />
        <Button onClick={restart} size="lg" className="mt-6 text-lg px-8">
          <RefreshCw className="mr-2 h-5 w-5" />
          Rejouer
        </Button>
      </Card>
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
        <Progress value={(currentIndex / NUM_ITEMS) * 100} className="flex-1 h-4 rounded-full" />
        <span className="text-muted-foreground font-medium tabular-nums text-lg">
          {currentIndex + 1}/{NUM_ITEMS}
        </span>
      </div>

      {/* Item card */}
      <Card
        className={cn(
          'w-full shadow-xl transition-all duration-300 border-4',
          feedback === 'correct' && 'bg-green-50 border-green-400',
          feedback === 'incorrect' && 'bg-red-50 border-red-400 animate-shake',
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
          {feedback === 'correct' && (
            <p className="text-2xl font-bold text-green-600 animate-in fade-in duration-200">✓ Bravo !</p>
          )}
          {feedback === 'incorrect' && (
            <p className="text-2xl font-bold text-red-500 animate-in fade-in duration-200">✗ Essaie encore !</p>
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
