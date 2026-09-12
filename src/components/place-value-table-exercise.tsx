'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import type { SkillLevel } from '@/lib/skills';
import { useSearchParams } from 'next/navigation';
import { getExerciseQuestions } from '@/services/exercise-pool';
import type { Question } from '@/lib/questions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Check, RefreshCw, X, Loader2 } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import {
  AnswerFeedback,
  DELAI_NOUVEL_ESSAI,
  ExerciseFinished,
  ExerciseProgress,
  useSecondChance,
  type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const NUM_QUESTIONS = 10;

interface PlaceValueTableMetadata {
  number: number;
  displayNumber: string;
  columns: string[];
  decomposition: Record<string, string>;
}

// Fonction pour déterminer la couleur d'une colonne selon sa position
// Unités = bleu, Dizaines = rouge, Centaines = vert, au-delà = noir
function getColumnColor(columnName: string): string {
  // Extrait la dernière lettre pour identifier le type de colonne
  const lastChar = columnName.charAt(columnName.length - 1);

  if (lastChar === 'U' || columnName.endsWith('UM')) {
    return 'bg-blue-100 text-blue-900'; // Unités en bleu
  } else if (lastChar === 'D' || columnName.endsWith('DM')) {
    return 'bg-red-100 text-red-900'; // Dizaines en rouge
  } else if (lastChar === 'C' || columnName.endsWith('CM')) {
    return 'bg-green-100 text-green-900'; // Centaines en vert
  } else {
    return 'bg-gray-100 text-gray-900'; // Au-delà en noir
  }
}

export function PlaceValueTableExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [level, setLevel] = useState<SkillLevel | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FeedbackStatus>(null);
  // Le droit à l'erreur : l'élève rejoue jusqu'à trouver, et seule la
  // première tentative compte pour le score.
  const secondChance = useSecondChance();
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student?.levels?.['place-value-table']) {
      setLevel(student.levels['place-value-table']);
    } else {
      setLevel('B'); // Default level
    }
  }, [student]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (level) {
        setIsLoading(true);
        const generatedQuestions = await getExerciseQuestions('place-value-table', NUM_QUESTIONS, {
          settings: { numberLevel: { level } },
          studentId: student?.id ?? null,
        });
        setQuestions(generatedQuestions);
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, [level]);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const metadata: PlaceValueTableMetadata | null = currentQuestion?.description
    ? JSON.parse(currentQuestion.description)
    : null;

  const handleNextQuestion = () => {
    secondChance.reset();
    setShowConfetti(false);
    if (currentQuestionIndex < NUM_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserInputs({});
      setFeedback(null);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      setIsFinished(true);
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion || feedback || !metadata) return;

    // Vérifie si tous les champs sont remplis correctement
    let isCorrect = true;
    const correctDecomposition = metadata.decomposition;

    for (const column of metadata.columns) {
      const userValue = (userInputs[column] || '').trim();
      const correctValue = correctDecomposition[column] || '';

      if (userValue !== correctValue) {
        isCorrect = false;
        break;
      }
    }

    const issue = secondChance.resultOnSuccess();
    const detail: ScoreDetail = {
      question: currentQuestion.question,
      userAnswer: JSON.stringify(userInputs),
      correctAnswer: currentQuestion.answer || '',
      status: issue,
    };

    // Faux : on ne passe pas à la suite. L'élève reprend la main
    // jusqu'à donner lui-même la bonne réponse — c'est ainsi qu'il la retient.
    if (!isCorrect) {
      secondChance.registerError();
      setFeedback('retry');
      setTimeout(() => {
        setFeedback(null);
        setUserInputs({});
      }, DELAI_NOUVEL_ESSAI);
      return;
    }

    setSessionDetails(prev => [...prev, detail]);

    // Seule une réussite du premier coup rapporte un point.
    if (issue === 'correct') {
      setCorrectAnswers(prev => prev + 1);
      setShowConfetti(true);
    }
    setFeedback(issue);
    setTimeout(handleNextQuestion, 2500);
  };

  useEffect(() => {
    const saveFinalScore = async () => {
      if (isFinished && student && !hasBeenSaved && level) {
        setHasBeenSaved(true);
        const score = (correctAnswers / NUM_QUESTIONS) * 100;
        if (isHomework && homeworkDate) {
          await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: 'place-value-table',
            score: score,
          });
        } else {
          await addScore({
            userId: student.id,
            skill: 'place-value-table',
            score: score,
            details: sessionDetails,
            numberLevelSettings: { level: level }
          });
        }
      }
    }
    saveFinalScore();
  }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, level, isHomework, homeworkDate]);

  const restartExercise = async () => {
    if (!level) return;
    setIsFinished(false);
    setCorrectAnswers(0);
    setCurrentQuestionIndex(0);
    setUserInputs({});
    setFeedback(null);
    setHasBeenSaved(false);
    setSessionDetails([]);
    setIsLoading(true);
    const generatedQuestions = await getExerciseQuestions('place-value-table', NUM_QUESTIONS, {
      settings: { numberLevel: { level } },
      studentId: student?.id ?? null,
    });
    setQuestions(generatedQuestions);
    setIsLoading(false);
  };

  if (isLoading || !currentQuestion || !metadata) {
    return (
      <Card className="w-full shadow-2xl p-8 text-center">
        <Loader2 className="mx-auto animate-spin" />
      </Card>
    );
  }

  if (isFinished) {
    return (
      <ExerciseFinished
        correct={correctAnswers}
        total={NUM_QUESTIONS}
        canRestart={!isHomework}
        onRestart={restartExercise}
        returnHref={isHomework ? '/devoirs' : '/en-classe'}
        returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ExerciseProgress
        current={currentQuestionIndex}
        total={NUM_QUESTIONS}
        results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')}
        className="mb-4"
      />
      <Card className="shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <Confetti active={showConfetti} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3, width: "10px", height: "10px"}} />
        </div>

        <CardHeader>
          <CardTitle className="font-headline text-2xl">Question {currentQuestionIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[350px] flex flex-col items-center justify-center gap-6 p-6">
          <p className="font-body text-xl sm:text-2xl font-semibold">{currentQuestion.question}</p>

          {/* Affichage du nombre */}
          <div className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            {metadata.displayNumber}
          </div>

          {/* Tableau de numération */}
          <div className="w-full overflow-x-auto">
            <table className="mx-auto border-collapse border-2 border-gray-400">
              <thead>
                <tr>
                  {/* Colonne pour afficher le nombre complet */}
                  <th className="border-2 border-gray-400 bg-gray-100 px-3 py-2 text-sm font-semibold">
                    Nombre
                  </th>
                  {metadata.columns.map((col, index) => (
                    <th key={index} className={cn("border-2 border-gray-400 px-3 py-2 text-sm font-semibold min-w-[60px]", getColumnColor(col))}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Afficher le nombre en chiffres dans la première colonne */}
                  <td className="border-2 border-gray-400 px-3 py-2 bg-gray-50 font-bold text-lg">
                    {metadata.number}
                  </td>
                  {metadata.columns.map((col, index) => (
                    <td key={index} className="border-2 border-gray-400 px-2 py-2">
                      <Input
                        ref={index === 0 ? firstInputRef : null}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={userInputs[col] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // N'accepter que les chiffres ou vide
                          if (value === '' || /^[0-9]$/.test(value)) {
                            setUserInputs(prev => ({ ...prev, [col]: value }));
                          }
                        }}
                        className={cn(
                          "h-12 w-12 text-2xl text-center font-numbers p-0",
                          (feedback === 'correct' || feedback === 'corrected') && 'border-green-500 ring-green-500',
                          feedback === 'retry' && userInputs[col] !== metadata.decomposition[col] && 'border-red-500 ring-red-500 animate-shake'
                        )}
                        disabled={!!feedback}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bouton pour valider */}
          {!feedback && (
            <Button onClick={checkAnswer} size="lg" className="mt-4">
              Valider
            </Button>
          )}

          {/* Feedback visuel */}
          {(feedback === 'correct' || feedback === 'corrected') && (
            <div className="flex items-center gap-2 text-green-600 text-xl font-bold">
              <Check className="h-8 w-8" /> Bravo !
            </div>
          )}
          {feedback === 'retry' && (
            <div className="flex items-center gap-2 text-red-600 text-xl font-bold animate-shake">
              <X className="h-8 w-8" /> Réessaie !
            </div>
          )}
        </CardContent>
        <CardFooter className="min-h-20 flex items-center justify-center">
          {/* On ne dévoile la réponse qu'après deux essais infructueux. */}
{secondChance.showHint && !feedback && (
            <div className="text-lg text-muted-foreground">
              La bonne réponse : {Object.entries(metadata.decomposition)
                .filter(([_, value]) => value !== '')
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </div>
          )}
        </CardFooter>
      </Card>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
