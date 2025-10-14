'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import type { SkillLevel } from '@/lib/skills';
import { useSearchParams } from 'next/navigation';
import { generatePlaceValueTableQuestion } from '@/lib/place-value-table-questions';
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

const NUM_QUESTIONS = 10;

interface PlaceValueTableMetadata {
  number: number;
  displayNumber: string;
  columns: string[];
  decomposition: Record<string, string>;
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
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
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
        const generatedQuestions: Question[] = [];
        for (let i = 0; i < NUM_QUESTIONS; i++) {
          const question = await generatePlaceValueTableQuestion({ level });
          generatedQuestions.push(question);
        }
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

    const detail: ScoreDetail = {
      question: currentQuestion.question,
      userAnswer: JSON.stringify(userInputs),
      correctAnswer: currentQuestion.answer || '',
      status: isCorrect ? 'correct' : 'incorrect',
    };
    setSessionDetails(prev => [...prev, detail]);

    if (isCorrect) {
      setFeedback('correct');
      setCorrectAnswers(prev => prev + 1);
      setShowConfetti(true);
    } else {
      setFeedback('incorrect');
    }
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
    const generatedQuestions: Question[] = [];
    for (let i = 0; i < NUM_QUESTIONS; i++) {
      const question = await generatePlaceValueTableQuestion({ level });
      generatedQuestions.push(question);
    }
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
    const score = (correctAnswers / NUM_QUESTIONS) * 100;
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-2xl">
            Tu as obtenu <span className="font-bold text-primary">{correctAnswers}</span> bonnes réponses sur <span className="font-bold">{NUM_QUESTIONS}</span>.
          </p>
          <ScoreTube score={score} />
          {isHomework ? (
            <p className="text-muted-foreground">Tes devoirs sont terminés !</p>
          ) : (
            <Button onClick={restartExercise} variant="outline" size="lg" className="mt-4">
              <RefreshCw className="mr-2" />
              Recommencer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Progress value={((currentQuestionIndex + 1) / NUM_QUESTIONS) * 100} className="w-full mb-4" />
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
                    <th key={index} className="border-2 border-gray-400 bg-blue-100 px-3 py-2 text-sm font-semibold min-w-[60px]">
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
                          feedback === 'correct' && 'border-green-500 ring-green-500',
                          feedback === 'incorrect' && userInputs[col] !== metadata.decomposition[col] && 'border-red-500 ring-red-500 animate-shake'
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
          {feedback === 'correct' && (
            <div className="flex items-center gap-2 text-green-600 text-xl font-bold">
              <Check className="h-8 w-8" /> Bravo !
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="flex items-center gap-2 text-red-600 text-xl font-bold animate-shake">
              <X className="h-8 w-8" /> Réessaie !
            </div>
          )}
        </CardContent>
        <CardFooter className="min-h-20 flex items-center justify-center">
          {feedback === 'incorrect' && (
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
