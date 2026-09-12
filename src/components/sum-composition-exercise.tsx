'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, X, Loader2, ThumbsUp, Trash2, Coins } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { currency, formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { SommeAComposer } from '@/lib/exercise-content/calcul-simple';
import { getPooledContent } from '@/services/exercise-pool';
import {
    AnswerFeedback,
    DELAI_NOUVEL_ESSAI,
    ExerciseFinished,
    ExerciseProgress,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const NUM_QUESTIONS = 5;

interface CurrencyItem {
    name: string;
    value: number;
    image: string;
    type: 'pièce' | 'billet';
}

export function SumCompositionExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [targetSums, setTargetSums] = useState<number[]>([]);
    const [selectedCoins, setSelectedCoins] = useState<CurrencyItem[]>([]);

    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    // Le droit à l'erreur : l'élève refait sa pile de pièces jusqu'au bon compte.
    const secondChance = useSecondChance();
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    // Helper to round to 2 decimals to avoid float issues
    const round = (num: number) => Math.round(num * 100) / 100;

    // Available currency: 1€, 2€, 5€ only
    const availableCurrency = useMemo(() => {
        return currency.filter(c => c.value === 1 || c.value === 2 || c.value === 5);
    }, []);

    // Les montants viennent du stock partagé : toute la classe compose les mêmes.
    useEffect(() => {
        const loadSums = async () => {
            const sommes = await getPooledContent<SommeAComposer>('composition-somme', NUM_QUESTIONS, {
                studentId: student?.id ?? null,
            });
            setTargetSums(sommes.map((s) => s.target));
        };
        loadSums();
    }, [student?.id]);

    const currentTargetSum = targetSums[currentQuestionIndex] || 0;

    const userTotal = useMemo(() => {
        return round(selectedCoins.reduce((acc, coin) => acc + coin.value, 0));
    }, [selectedCoins]);

    const handleAddCoin = (coin: CurrencyItem) => {
        if (feedback) return;
        setSelectedCoins(prev => [...prev, coin]);
    };

    const handleRemoveCoin = (index: number) => {
        if (feedback) return;
        setSelectedCoins(prev => prev.filter((_, i) => i !== index));
    };

    const checkAnswer = () => {
        if (feedback) return;

        const isCorrect = Math.abs(userTotal - currentTargetSum) < 0.001;

        // Faux : on vide la pile et l'élève recompose. Le montant à atteindre
        // reste affiché, c'est en refaisant qu'il comprend son erreur.
        if (!isCorrect) {
            secondChance.registerError();
            setFeedback('retry');
            setTimeout(() => {
                setFeedback(null);
                setSelectedCoins([]);
            }, DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        setSessionDetails(prev => [...prev, {
            question: `Compose ${formatCurrency(currentTargetSum)}`,
            userAnswer: formatCurrency(userTotal),
            correctAnswer: formatCurrency(currentTargetSum),
            status: issue,
        }]);

        // Seule une réussite du premier coup rapporte un point.
        if (issue === 'correct') {
            setCorrectAnswers(prev => prev + 1);
            setShowConfetti(true);
        }
        setFeedback(issue);

        setTimeout(handleNextQuestion, 2500);
    };

    const handleNextQuestion = () => {
        setShowConfetti(false);
        secondChance.reset();
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedCoins([]);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };

    const restartExercise = async () => {
        const sommes = await getPooledContent<SommeAComposer>('composition-somme', NUM_QUESTIONS, {
            studentId: student?.id ?? null,
        });
        setTargetSums(sommes.map((s) => s.target));
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setIsFinished(false);
        setHasBeenSaved(false);
        setSessionDetails([]);
        setSelectedCoins([]);
        setFeedback(null);
        setShowConfetti(false);
    };

    useEffect(() => {
        const saveResult = async () => {
            if (isFinished && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const score = (correctAnswers / NUM_QUESTIONS) * 100;
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'composition-somme',
                        score: score
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'composition-somme',
                        score: score,
                        details: sessionDetails,
                    });
                }
            }
        };
        saveResult();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    if (targetSums.length === 0) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-2xl p-6">
                <CardContent className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </CardContent>
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
        <Card className="w-full max-w-4xl mx-auto shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center flex items-center justify-center gap-2">
                    <Coins className="h-8 w-8 text-primary" />
                    Composition de Somme
                </CardTitle>
                <CardDescription className="text-center text-lg">
                    Sélectionne les pièces et billets pour composer la somme demandée.
                </CardDescription>
                <ExerciseProgress
                    current={currentQuestionIndex}
                    total={NUM_QUESTIONS}
                    results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')}
                    className="mt-4"
                />
            </CardHeader>
            <CardContent className="flex flex-col gap-8 p-6">

                {/* Target Sum Display */}
                <div className="flex flex-col items-center gap-4 bg-primary/10 p-6 rounded-xl border-2 border-primary/20">
                    <div className="text-sm uppercase font-bold text-muted-foreground tracking-wider">Somme à composer</div>
                    <div className="text-6xl font-bold text-primary font-mono">
                        {formatCurrency(currentTargetSum)}
                    </div>
                </div>

                {/* Interaction Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* User Selection Tray */}
                    <div className="bg-slate-50 p-4 rounded-xl border shadow-inner min-h-[200px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-slate-700">Ta composition :</h3>
                            <span className={cn(
                                "text-2xl font-mono font-bold",
                                userTotal > currentTargetSum ? "text-red-500" : userTotal === currentTargetSum ? "text-green-600" : "text-blue-600"
                            )}>
                                {formatCurrency(userTotal)}
                            </span>
                        </div>

                        <div className="flex-grow flex flex-wrap content-start gap-2 p-2">
                            {selectedCoins.map((coin, idx) => (
                                <button
                                    key={`${coin.name}-${idx}`}
                                    onClick={() => handleRemoveCoin(idx)}
                                    className="relative w-16 h-16 transition-transform hover:scale-110 active:scale-95"
                                    disabled={!!feedback}
                                >
                                    <Image
                                        src={coin.image}
                                        alt={coin.name}
                                        fill
                                        className="object-contain drop-shadow-sm"
                                    />
                                </button>
                            ))}
                            {selectedCoins.length === 0 && (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
                                    Clique sur les pièces et billets pour composer la somme.
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCoins([])}
                                disabled={selectedCoins.length === 0 || !!feedback}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Tout effacer
                            </Button>
                        </div>
                    </div>

                    {/* Available Currency */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-slate-700 text-center">Pièces et billets disponibles</h3>
                        <div className="grid grid-cols-3 gap-4 justify-items-center">
                            {availableCurrency.map((coin) => (
                                <button
                                    key={coin.name}
                                    onClick={() => handleAddCoin(coin)}
                                    disabled={!!feedback}
                                    className="relative w-20 h-20 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Image
                                        src={coin.image}
                                        alt={coin.name}
                                        fill
                                        className="object-contain drop-shadow-md"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6 pb-8">
                <Button size="lg" onClick={checkAnswer} disabled={!!feedback || selectedCoins.length === 0} className="text-xl px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <Check className="mr-2 h-6 w-6" /> Valider
                </Button>

                <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full max-w-xl">
                    {feedback === 'retry'
                        ? `Tu as composé ${formatCurrency(userTotal)}. Il faut ${formatCurrency(currentTargetSum)}.`
                        : undefined}
                </AnswerFeedback>
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
    );
}
