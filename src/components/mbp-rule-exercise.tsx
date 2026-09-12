
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import { Check, RefreshCw, X, ThumbsUp } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import type { MbpQuestion } from '@/lib/exercise-content/regle-mbp';
import { getPooledContent } from '@/services/exercise-pool';
import {
    DELAI_NOUVEL_ESSAI,
  AnswerFeedback,
    ExerciseFinished,
    ExerciseProgress,
    HINT_CLASSES,
    QuestionCard,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const NUM_QUESTIONS = 10;

export function MbpRuleExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [questions, setQuestions] = useState<MbpQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    const secondChance = useSecondChance();
    const [choix, setChoix] = useState<'n' | 'm' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    
    useEffect(() => {
        const loadQuestions = async () => {
            setQuestions(await getPooledContent<MbpQuestion>('regle-mbp', NUM_QUESTIONS, {
                studentId: student?.id ?? null,
            }));
        };
        loadQuestions();
    }, [student?.id]);

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    const handleNextQuestion = () => {
        setShowConfetti(false);
        setFeedback(null);
        setChoix(null);
        secondChance.reset();
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };
    
    const checkAnswer = (selectedLetter: 'n' | 'm') => {
        if (feedback) return;
        setChoix(selectedLetter);

        // Faux : l'élève garde la main et finit par écrire la bonne lettre.
        if (selectedLetter !== currentQuestion.correctLetter) {
            secondChance.registerError(selectedLetter);
            setFeedback('retry');
            setTimeout(() => {
                setFeedback(null);
                setChoix(null);
            }, DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        const detail: ScoreDetail = {
            question: `Compléter: ${currentQuestion.missingPart}`,
            userAnswer: selectedLetter,
            correctAnswer: currentQuestion.correctLetter,
            status: issue,
        };
        setSessionDetails(prev => [...prev, detail]);

        // Seule une réussite du premier coup rapporte un point.
        if (issue === 'correct') {
            setCorrectAnswers(prev => prev + 1);
            setShowConfetti(true);
        }
        setFeedback(issue);
        setTimeout(handleNextQuestion, 1500);
    };

     useEffect(() => {
      const saveFinalScore = async () => {
           if (isFinished && student && !hasBeenSaved) {
              setHasBeenSaved(true);
              const score = (correctAnswers / NUM_QUESTIONS) * 100;
              if (isHomework && homeworkDate) {
                await saveHomeworkResult({
                    userId: student.id,
                    date: homeworkDate,
                    skillSlug: 'regle-mbp',
                    score: score
                });
              } else {
                await addScore({
                    userId: student.id,
                    skill: 'regle-mbp',
                    score: score,
                    details: sessionDetails,
                });
              }
          }
      }
      saveFinalScore();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    const restartExercise = async () => {
        setQuestions(await getPooledContent<MbpQuestion>('regle-mbp', NUM_QUESTIONS, {
            studentId: student?.id ?? null,
        }));
        setIsFinished(false);
        setCorrectAnswers(0);
        setCurrentQuestionIndex(0);
        setFeedback(null);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };
    
    if (questions.length === 0 || !currentQuestion) {
        return <p className="p-8 text-center text-muted-foreground">Je prépare les mots…</p>;
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

    const wordParts = currentQuestion.missingPart.split('___');
    const resultats = sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect');

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-1">
            <ExerciseProgress current={currentQuestionIndex} total={NUM_QUESTIONS} results={resultats} />

            <QuestionCard instruction="Complète le mot avec n ou m">
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
                </div>

                <p className="text-center font-body text-5xl font-bold tracking-wider sm:text-6xl">
                    <span>{wordParts[0]}</span>
                    <span className="inline-block min-w-[4rem] border-b-4 border-dashed border-muted-foreground text-center align-bottom">
                        {(feedback === 'correct' || feedback === 'corrected') && (
                            <span className="animate-in fade-in text-emerald-600">{currentQuestion.correctLetter}</span>
                        )}
                    </span>
                    <span>{wordParts[1]}</span>
                </p>

                <div className="mx-auto mt-8 grid w-full max-w-xs grid-cols-2 gap-6">
                    {(['m', 'n'] as const).map(option => {
                        const estLaBonne = option === currentQuestion.correctLetter;
                        const estMonChoix = option === choix;
                        return (
                            <Button
                                key={option}
                                variant="outline"
                                onClick={() => checkAnswer(option)}
                                disabled={!!feedback}
                                className={cn(
                                    'h-24 justify-center p-4 font-mono text-4xl transition-all duration-300 active:scale-95 disabled:opacity-100',
                                    (feedback === 'correct' || feedback === 'corrected') && estLaBonne && 'border-emerald-600 bg-emerald-500 text-white',
                                    feedback === 'retry' && estMonChoix && 'border-red-600 bg-red-500 text-white',
                                    secondChance.showHint && !feedback && estLaBonne && HINT_CLASSES
                                )}
                            >
                                {option}
                            </Button>
                        );
                    })}
                </div>

                {/* La règle sous les yeux : c'est un exercice de règle, pas un
                    exercice de mémoire. On la rappelle, sans donner la réponse. */}
                <p className="mt-6 rounded-[16px] border border-dashed bg-muted/40 p-3 text-center text-sm font-semibold text-muted-foreground">
                    On écrit <span className="font-mono text-base text-foreground">m</span> devant{' '}
                    <span className="font-mono text-base text-foreground">m</span>,{' '}
                    <span className="font-mono text-base text-foreground">b</span> et{' '}
                    <span className="font-mono text-base text-foreground">p</span>.
                </p>
            </QuestionCard>

            <AnswerFeedback status={feedback} hinted={secondChance.showHint} correctAnswer={currentQuestion.correctLetter} />
        </div>
    );
}
