
'use client';

import { useState, useEffect, useMemo, useContext, useRef } from 'react';
import type { SkillLevel } from '@/lib/skills';
import { useSearchParams } from 'next/navigation';
import { getExerciseQuestions } from '@/services/exercise-pool';
import type { Question } from '@/lib/questions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../components/ui/button';
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

export function MentalCalculationExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [level, setLevel] = useState<SkillLevel | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<FeedbackStatus>(null);
  // Le droit à l'erreur : l'élève rejoue jusqu'à trouver, et seule la
  // première tentative compte pour le score.
  const secondChance = useSecondChance();
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student?.levels?.['mental-calculation']) {
      setLevel(student.levels['mental-calculation']);
    } else {
      setLevel('B'); // Default level
    }
  }, [student]);

  useEffect(() => {
    if (!level) return;
    const loadQuestions = async () => {
      setIsLoading(true);
      setQuestions(await getExerciseQuestions('mental-calculation', NUM_QUESTIONS, {
        settings: { numberLevel: { level } },
        studentId: student?.id ?? null,
      }));
      setIsLoading(false);
    };
    loadQuestions();
  }, [level, student?.id]);

  const currentQuestion = useMemo(() => {
    if (questions.length > 0) {
      return questions[currentQuestionIndex];
    }
    return null;
  }, [questions, currentQuestionIndex]);

  const handleNextQuestion = () => {
    secondChance.reset();
    setShowConfetti(false);
    if (currentQuestionIndex < NUM_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsFinished(true);
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion || feedback || !currentQuestion.answer) return;
    
    const userAnswer = userInput.replace(',', '.').trim();
    const isCorrect = parseFloat(userAnswer) === parseFloat(currentQuestion.answer);
    
    const issue = secondChance.resultOnSuccess();
    const detail: ScoreDetail = {
      question: currentQuestion.question,
      userAnswer: userAnswer || "vide",
      correctAnswer: String(currentQuestion.answer),
      status: issue,
    };

    // Faux : on ne passe pas à la suite. L'élève reprend la main
    // jusqu'à donner lui-même la bonne réponse — c'est ainsi qu'il la retient.
    if (!isCorrect) {
      secondChance.registerError();
      setFeedback('retry');
      setTimeout(() => {
        setFeedback(null);
        setUserInput('');
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
    setTimeout(handleNextQuestion, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
  }

  useEffect(() => {
      const saveFinalScore = async () => {
           if (isFinished && student && !hasBeenSaved && level) {
              setHasBeenSaved(true);
              const score = (correctAnswers / NUM_QUESTIONS) * 100;
              if (isHomework && homeworkDate) {
                  await saveHomeworkResult({
                      userId: student.id,
                      date: homeworkDate,
                      skillSlug: 'mental-calculation',
                      score: score,
                  });
              } else {
                  await addScore({
                      userId: student.id,
                      skill: 'mental-calculation',
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
    setIsFinished(false);
    setCorrectAnswers(0);
    setCurrentQuestionIndex(0);
    setUserInput('');
    setFeedback(null);
    setHasBeenSaved(false);
    setSessionDetails([]);
    if (level) {
      setIsLoading(true);
      setQuestions(await getExerciseQuestions('mental-calculation', NUM_QUESTIONS, {
        settings: { numberLevel: { level } },
        studentId: student?.id ?? null,
      }));
      setIsLoading(false);
    }
  };

  if (isLoading || !currentQuestion) {
    return <Card className="w-full shadow-2xl p-8 text-center"><Loader2 className="mx-auto animate-spin" /></Card>;
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
    <div className="w-full max-w-2xl mx-auto">
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
            <CardContent className="min-h-[250px] flex flex-col items-center justify-center gap-8 p-6">
                {currentQuestion.visuals && (
                    <div className="flex items-center justify-center gap-4 my-4 text-4xl">
                        {currentQuestion.visuals.map((vis, index) => (
                           <div key={index} className="flex items-center gap-2">
                                {Array.from({ length: vis.count }).map((_, i) => (
                                    <span key={i}>{vis.emoji}</span>
                                ))}
                                {index < currentQuestion.visuals!.length - 1 && currentQuestion.question.includes('+') && (
                                  <span className="text-2xl font-bold mx-2">+</span>
                                )}
                           </div>
                        ))}
                    </div>
                )}
                <p className="font-body text-5xl sm:text-6xl font-bold tracking-wider">{currentQuestion.question}</p>
                <div className="relative w-full max-w-sm">
                    <Input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ta réponse..."
                        className={cn(
                          "h-20 text-4xl text-center font-numbers",
                          (feedback === 'correct' || feedback === 'corrected') && 'border-green-500 ring-green-500',
                          feedback === 'retry' && 'border-red-500 ring-red-500 animate-shake'
                        )}
                        disabled={!!feedback}
                        autoFocus
                    />
                    {(feedback === 'correct' || feedback === 'corrected') && <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-green-500"/>}
                    {feedback === 'retry' && <X className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-red-500"/>}
                </div>
            </CardContent>
            <CardFooter className="flex min-h-[6rem] flex-col items-center justify-center gap-2 p-4">
              <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full max-w-xl" />
                 {/* On ne dévoile la réponse qu'après deux essais infructueux. */}
{secondChance.showHint && !feedback && (
                    <div className="text-xl font-bold text-red-600 animate-shake">
                        La bonne réponse était {currentQuestion.answer}.
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

    

    