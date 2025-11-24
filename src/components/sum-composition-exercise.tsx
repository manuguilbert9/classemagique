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

    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
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

    // Initialize target sums (5 unique random sums between 1 and 9)
    useEffect(() => {
        const generateUniqueSums = () => {
            const sums: number[] = [];
            const possibleSums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const shuffled = [...possibleSums].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, NUM_QUESTIONS);
        };
        setTargetSums(generateUniqueSums());
    }, []);

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

        const detail: ScoreDetail = {
            question: `Compose ${formatCurrency(currentTargetSum)}`,
            userAnswer: formatCurrency(userTotal),
            correctAnswer: formatCurrency(currentTargetSum),
            status: isCorrect ? 'correct' : 'incorrect',
        };
        setSessionDetails(prev => [...prev, detail]);

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
            setFeedback('correct');
            setShowConfetti(true);
        } else {
            setFeedback('incorrect');
        }

        setTimeout(handleNextQuestion, 2500);
    };

    const handleNextQuestion = () => {
        setShowConfetti(false);
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedCoins([]);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };

    const restartExercise = () => {
        const generateUniqueSums = () => {
            const possibleSums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const shuffled = [...possibleSums].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, NUM_QUESTIONS);
        };
        setTargetSums(generateUniqueSums());
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
        const score = (correctAnswers / NUM_QUESTIONS) * 100;
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
                <CardHeader><CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as composé correctement <span className="font-bold text-primary">{correctAnswers}</span> sommes sur <span className="font-bold">{NUM_QUESTIONS}</span>.
                    </p>
                    <ScoreTube score={score} />
                    <Button onClick={restartExercise} variant="outline" size="lg" className="mt-4"><RefreshCw className="mr-2" />Recommencer</Button>
                </CardContent>
            </Card>
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
                <Progress value={((currentQuestionIndex) / NUM_QUESTIONS) * 100} className="w-full mt-4 h-3" />
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

                {feedback === 'correct' && (
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-2 animate-pulse bg-green-50 px-6 py-3 rounded-full border border-green-200">
                        <ThumbsUp className="h-8 w-8" /> Bravo ! C'est exact.
                    </div>
                )}
                {feedback === 'incorrect' && (
                    <div className="text-xl font-bold text-red-600 flex flex-col items-center gap-2 animate-shake bg-red-50 px-6 py-3 rounded-xl border border-red-200">
                        <div className="flex items-center gap-2"><X className="h-6 w-6" /> Ce n'est pas ça.</div>
                        <div className="text-base font-normal text-slate-700">
                            Il fallait composer <span className="font-bold">{formatCurrency(currentTargetSum)}</span>.
                        </div>
                    </div>
                )}
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
