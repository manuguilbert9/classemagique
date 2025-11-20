'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, X, Loader2, ThumbsUp, Trash2, ShoppingBag } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { currency, formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '@/lib/skills';
import Image from 'next/image';

const NUM_QUESTIONS = 5;

// Items to sell
const MARKET_ITEMS = [
    { name: "un livre", emoji: "📚" },
    { name: "un ballon", emoji: "⚽" },
    { name: "une poupée", emoji: "🧸" },
    { name: "une voiture", emoji: "🚗" },
    { name: "un jeu", emoji: "🎮" },
    { name: "un chapeau", emoji: "hat" }, // using emoji directly in render if needed or lucide
    { name: "une pomme", emoji: "🍎" },
    { name: "un gâteau", emoji: "🍰" },
    { name: "un vélo", emoji: "🚲" },
    { name: "une guitare", emoji: "🎸" },
    { name: "un robot", emoji: "🤖" },
    { name: "une plante", emoji: "🪴" },
];

interface CurrencyItem {
    name: string;
    value: number;
    image: string;
    type: 'pièce' | 'billet';
}

export function FleaMarketExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [level, setLevel] = useState<SkillLevel>('B');

    // Game state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentItem, setCurrentItem] = useState<{ name: string, emoji: string } | null>(null);
    const [price, setPrice] = useState(0);
    const [payment, setPayment] = useState(0);
    const [paymentImage, setPaymentImage] = useState<string | null>(null);

    const [userChange, setUserChange] = useState<CurrencyItem[]>([]);

    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    useEffect(() => {
        if (student?.levels?.['flea-market']) {
            setLevel(student.levels['flea-market']);
        }
    }, [student]);

    // Helper to round to 2 decimals to avoid float issues
    const round = (num: number) => Math.round(num * 100) / 100;

    const generateQuestion = useMemo(() => {
        return () => {
            const item = MARKET_ITEMS[Math.floor(Math.random() * MARKET_ITEMS.length)];
            setCurrentItem(item);

            let newPrice = 0;
            let possiblePayments: number[] = [];

            if (level === 'B') {
                // Level B: Integers < 20, no cents
                newPrice = Math.floor(Math.random() * 18) + 1; // 1 to 18
                // Payment must be greater than price
                const bills = [5, 10, 20, 50];
                possiblePayments = bills.filter(b => b > newPrice);
            } else if (level === 'C') {
                // Level C: Integers < 100, no cents
                newPrice = Math.floor(Math.random() * 90) + 5; // 5 to 95
                const bills = [10, 20, 50, 100, 200];
                possiblePayments = bills.filter(b => b > newPrice);
            } else {
                // Level D: With cents
                const euros = Math.floor(Math.random() * 45) + 1;
                const cents = [0.10, 0.20, 0.50, 0.90, 0.95, 0.99][Math.floor(Math.random() * 6)];
                newPrice = round(euros + cents);
                const bills = [5, 10, 20, 50, 100];
                possiblePayments = bills.filter(b => b > newPrice);
            }

            // Fallback if no payment found (rare but possible if price is high)
            if (possiblePayments.length === 0) possiblePayments = [Math.ceil(newPrice / 10) * 10 + 10];

            // Pick the smallest possible payment that is strictly greater (simulate realistic payment)
            // or random one? Let's pick a random one from valid options to vary difficulty
            const selectedPayment = possiblePayments[Math.floor(Math.random() * Math.min(3, possiblePayments.length))];

            setPrice(newPrice);
            setPayment(selectedPayment);

            // Find image for payment if it exists in our currency list
            const currencyItem = currency.find(c => c.value === selectedPayment);
            setPaymentImage(currencyItem ? currencyItem.image : null);

            setUserChange([]);
            setFeedback(null);
        };
    }, [level]);

    useEffect(() => {
        generateQuestion();
    }, [generateQuestion, currentQuestionIndex]);

    const handleAddMoney = (item: CurrencyItem) => {
        if (feedback) return;
        setUserChange(prev => [...prev, item]);
    };

    const handleRemoveMoney = (index: number) => {
        if (feedback) return;
        setUserChange(prev => prev.filter((_, i) => i !== index));
    };

    const userTotal = useMemo(() => {
        return round(userChange.reduce((acc, item) => acc + item.value, 0));
    }, [userChange]);

    const checkAnswer = () => {
        if (feedback) return;

        const expectedChange = round(payment - price);
        const isCorrect = Math.abs(userTotal - expectedChange) < 0.001; // Float safety

        const detail: ScoreDetail = {
            question: `Prix: ${formatCurrency(price)}, Payé: ${formatCurrency(payment)}. Rendu ?`,
            userAnswer: formatCurrency(userTotal),
            correctAnswer: formatCurrency(expectedChange),
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
        } else {
            setIsFinished(true);
        }
    };

    const restartExercise = () => {
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setIsFinished(false);
        setHasBeenSaved(false);
        setSessionDetails([]);
        generateQuestion();
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
                        skillSlug: 'flea-market',
                        score: score
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'flea-market',
                        score: score,
                        details: sessionDetails,
                        numberLevelSettings: { level }
                    });
                }
            }
        };
        saveResult();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate, level]);

    // Filter available currency based on level
    const availableCurrency = useMemo(() => {
        if (level === 'B' || level === 'C') {
            // No cents for B and C (except maybe 1€, 2€ coins)
            return currency.filter(c => c.value >= 1);
        }
        return currency;
    }, [level]);

    if (isFinished) {
        const score = (correctAnswers / NUM_QUESTIONS) * 100;
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
                <CardHeader><CardTitle className="text-4xl font-headline mb-4">Brocante terminée !</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as rendu la bonne monnaie <span className="font-bold text-primary">{correctAnswers}</span> fois sur <span className="font-bold">{NUM_QUESTIONS}</span>.
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
                    <ShoppingBag className="h-8 w-8 text-primary" />
                    La Brocante
                </CardTitle>
                <CardDescription className="text-center text-lg">
                    Je t'achète un objet. Rends-moi la monnaie exacte !
                </CardDescription>
                <Progress value={((currentQuestionIndex) / NUM_QUESTIONS) * 100} className="w-full mt-4 h-3" />
            </CardHeader>
            <CardContent className="flex flex-col gap-8 p-6">

                {/* Scenario Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-muted/30 p-6 rounded-xl border-2 border-dashed border-primary/20">
                    {/* Item to sell */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-6xl animate-bounce-slow">{currentItem?.emoji}</div>
                        <div className="font-bold text-xl">{currentItem?.name}</div>
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border font-mono text-2xl text-primary font-bold transform -rotate-3">
                            {formatCurrency(price)}
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:block text-4xl text-muted-foreground">➡️</div>

                    {/* Payment */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Je te donne</div>
                        {paymentImage ? (
                            <div className="relative w-32 h-20 md:w-40 md:h-24 transition-transform hover:scale-105">
                                <Image
                                    src={paymentImage}
                                    alt={`${payment}€`}
                                    fill
                                    className="object-contain drop-shadow-md"
                                />
                            </div>
                        ) : (
                            <div className="text-4xl font-bold bg-green-100 text-green-800 px-6 py-4 rounded-lg border-2 border-green-300">
                                {formatCurrency(payment)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Interaction Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Money Tray (User Selection) */}
                    <div className="bg-slate-50 p-4 rounded-xl border shadow-inner min-h-[200px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-slate-700">Ta monnaie à rendre :</h3>
                            <span className={cn(
                                "text-2xl font-mono font-bold",
                                userTotal > (payment - price) ? "text-red-500" : "text-blue-600"
                            )}>
                                {formatCurrency(userTotal)}
                            </span>
                        </div>

                        <div className="flex-grow flex flex-wrap content-start gap-2 p-2">
                            {userChange.map((item, idx) => (
                                <button
                                    key={`${item.name}-${idx}`}
                                    onClick={() => handleRemoveMoney(idx)}
                                    className="relative w-16 h-16 transition-transform hover:scale-110 active:scale-95"
                                    disabled={!!feedback}
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain drop-shadow-sm"
                                    />
                                </button>
                            ))}
                            {userChange.length === 0 && (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
                                    Clique sur les pièces et billets pour préparer la monnaie.
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUserChange([])}
                                disabled={userChange.length === 0 || !!feedback}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Tout effacer
                            </Button>
                        </div>
                    </div>

                    {/* Cash Register (Available Money) */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-slate-700 text-center">La caisse</h3>
                        <div className="grid grid-cols-4 gap-3 justify-items-center">
                            {availableCurrency.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => handleAddMoney(item)}
                                    disabled={!!feedback}
                                    className="relative w-16 h-16 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.name}
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
                <Button size="lg" onClick={checkAnswer} disabled={!!feedback || userChange.length === 0} className="text-xl px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <Check className="mr-2 h-6 w-6" /> Je rends la monnaie
                </Button>

                {feedback === 'correct' && (
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-2 animate-pulse bg-green-50 px-6 py-3 rounded-full border border-green-200">
                        <ThumbsUp className="h-8 w-8" /> Merci ! Le compte est bon.
                    </div>
                )}
                {feedback === 'incorrect' && (
                    <div className="text-xl font-bold text-red-600 flex flex-col items-center gap-2 animate-shake bg-red-50 px-6 py-3 rounded-xl border border-red-200">
                        <div className="flex items-center gap-2"><X className="h-6 w-6" /> Ce n'est pas ça.</div>
                        <div className="text-base font-normal text-slate-700">
                            Il fallait rendre <span className="font-bold">{formatCurrency(round(payment - price))}</span>.
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
                .animate-bounce-slow {
                    animation: bounce 2s infinite;
                }
            `}</style>
        </Card>
    );
}
