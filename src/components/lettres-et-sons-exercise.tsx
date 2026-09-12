
'use client';

import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, RefreshCw, Volume2, ThumbsUp } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { Checkbox } from './ui/checkbox';
import type { SoundQuestion } from '@/lib/exercise-content/lettres-et-sons';
import { getPooledContent } from '@/services/exercise-pool';
import {
    DELAI_NOUVEL_ESSAI,
  AnswerFeedback,
    ExerciseFinished,
    ExerciseProgress,
    HINT_CLASSES,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const NUM_QUESTIONS = 10;

export function LettresEtSonsExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [questions, setQuestions] = useState<SoundQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    const secondChance = useSecondChance();
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    useEffect(() => {
        const loadQuestions = async () => {
            setQuestions(await getPooledContent<SoundQuestion>('lettres-et-sons', NUM_QUESTIONS, {
                studentId: student?.id ?? null,
            }));
        };
        loadQuestions();
    }, [student?.id]);

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    const handleSpeak = useCallback((text: string) => {
        if (!text || !('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, []);

    const handleNextQuestion = () => {
        secondChance.reset();
        setShowConfetti(false);
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedWords([]);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };
    
    const checkAnswer = () => {
        if (feedback) return;

        const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect).map(opt => opt.word);
        
        // Check if the selected words match the correct words perfectly
        const isCorrect = selectedWords.length === correctOptions.length &&
                          selectedWords.every(word => correctOptions.includes(word));

        // Faux : la sélection reste à l'écran et l'élève la corrige lui-même.
        if (!isCorrect) {
            secondChance.registerError();
            setFeedback('retry');
            setTimeout(() => setFeedback(null), DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        const detail: ScoreDetail = {
            question: `Identifier les mots avec le son [${currentQuestion.sound}]`,
            userAnswer: selectedWords.join(', '),
            correctAnswer: correctOptions.join(', '),
            status: issue,
        };
        setSessionDetails(prev => [...prev, detail]);

        // Seule une réussite du premier coup rapporte un point.
        if (issue === 'correct') {
            setCorrectAnswersCount(prev => prev + 1);
            setShowConfetti(true);
        }
        setFeedback(issue);
        setTimeout(handleNextQuestion, 2000);
    };

    const handleToggleWord = (word: string) => {
        setSelectedWords(prev => 
            prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
        );
    };

    useEffect(() => {
        const saveFinalScore = async () => {
             if (isFinished && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const score = (correctAnswersCount / NUM_QUESTIONS) * 100;
                if (isHomework && homeworkDate) {
                  await saveHomeworkResult({
                      userId: student.id,
                      date: homeworkDate,
                      skillSlug: 'lettres-et-sons',
                      score: score
                  });
                } else {
                  await addScore({
                      userId: student.id,
                      skill: 'lettres-et-sons',
                      score: score,
                      details: sessionDetails,
                  });
                }
            }
        }
        saveFinalScore();
      }, [isFinished, student, correctAnswersCount, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    const restartExercise = async () => {
        setQuestions(await getPooledContent<SoundQuestion>('lettres-et-sons', NUM_QUESTIONS, {
            studentId: student?.id ?? null,
        }));
        setIsFinished(false);
        setCorrectAnswersCount(0);
        setCurrentQuestionIndex(0);
        setSelectedWords([]);
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
                correct={correctAnswersCount}
                total={NUM_QUESTIONS}
                canRestart={!isHomework}
                onRestart={restartExercise}
                returnHref={isHomework ? '/devoirs' : '/en-classe'}
                returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
            />
        );
    }

    const aTrouver = currentQuestion.options.filter(o => o.isCorrect).length;
    const resultats = sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect');

    return (
        <div className="mx-auto w-full max-w-2xl p-1">
            <ExerciseProgress current={currentQuestionIndex} total={NUM_QUESTIONS} results={resultats} className="mb-4" />
            <Card className="relative overflow-hidden rounded-[22px] text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3 }} />
                </div>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">
                        Coche les mots où tu <strong>entends</strong> le son <span className="text-primary font-mono text-3xl">[{currentQuestion.sound}]</span>
                    </CardTitle>
                    <CardDescription>
                        Il y en a <strong>{aTrouver}</strong>. Clique sur le haut-parleur pour écouter un mot.
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[250px] flex flex-col items-center justify-center gap-4 p-6">
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {currentQuestion.options.map(option => {
                             const isSelected = selectedWords.includes(option.word);
                             const estTrouve = feedback === 'correct' || feedback === 'corrected';
                             const showCorrect = estTrouve && option.isCorrect;
                             // Sur un nouvel essai, on ne pointe que les mots cochés à tort.
                             const showIncorrect = feedback === 'retry' && isSelected && !option.isCorrect;
                             const estGuide = secondChance.showHint && !feedback && option.isCorrect;
                            return (
                            <div
                                key={option.word}
                                onClick={() => !feedback && handleToggleWord(option.word)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    isSelected && !feedback && "border-primary bg-primary/10",
                                    !isSelected && !feedback && "border-border bg-card",
                                    feedback && "cursor-not-allowed",
                                    showCorrect && "bg-green-100 border-green-500",
                                    showIncorrect && "bg-red-100 border-red-500 animate-shake",
                                    estGuide && HINT_CLASSES
                                )}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    className="h-6 w-6"
                                />
                                <p className="font-bold text-2xl uppercase flex-1">{option.word}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); handleSpeak(option.word); }}
                                    disabled={!!feedback}
                                    className="h-12 w-12"
                                >
                                    <Volume2 className="h-8 w-8 text-muted-foreground" />
                                </Button>
                            </div>
                        )})}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center gap-3 pb-6">
                     <Button
                        onClick={checkAnswer}
                        disabled={!!feedback || selectedWords.length === 0}
                        size="lg"
                    >
                        Valider
                    </Button>
                    <AnswerFeedback
                        status={feedback}
                        hinted={secondChance.showHint}
                        className="w-full"
                        correctAnswer={currentQuestion.options.filter(o => o.isCorrect).map(o => o.word).join(', ')}
                    />
                </CardFooter>
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
            </Card>
        </div>
    );
}
