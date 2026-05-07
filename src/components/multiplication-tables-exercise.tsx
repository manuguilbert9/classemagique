'use client';

import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { Check, RefreshCw, X, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

const GAME_DURATION_S = 60; // 1 minute
const UNTIMED_QUESTIONS_COUNT = 20;

interface MultiplicationQuestion {
    id: string;
    a: number; // Table
    b: number; // Multiplier
}

export function MultiplicationTablesExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
    const [selectedTables, setSelectedTables] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
    const [currentQuestion, setCurrentQuestion] = useState<MultiplicationQuestion | null>(null);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [timerEnabled, setTimerEnabled] = useState(true);
    const [questionCount, setQuestionCount] = useState(0);

    // Track viewed questions to avoid immediate repetition if possible,
    // though with multiplication tables repetition is sometimes desired.
    // Let's just avoid the EXACT same question twice in a row.
    const lastQuestionRef = useRef<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);

    // Progressive logic: start with easier multipliers
    const generateQuestion = useCallback((tables: number[], timeRemaining: number): MultiplicationQuestion => {
        if (tables.length === 0) return { id: 'error', a: 1, b: 1 };

        let a = 0, b = 0;
        let id = '';
        let attempts = 0;

        // Progressive logic
        // First 15 seconds (timeRemaining > 45): favor 1, 2, 5, 10
        // Next 15 seconds (timeRemaining > 30): favor 1, 2, 3, 4, 5, 10
        // Rest: any

        const easyMultipliers = [1, 2, 5, 10];
        const mediumMultipliers = [1, 2, 3, 4, 5, 10];

        let allowedMultipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        if (timeRemaining > 45) {
            // 80% chance to pick easy
            if (Math.random() < 0.8) allowedMultipliers = easyMultipliers;
        } else if (timeRemaining > 30) {
            // 60% chance to pick medium
            if (Math.random() < 0.6) allowedMultipliers = mediumMultipliers;
        }

        do {
            const tableIndex = Math.floor(Math.random() * tables.length);
            a = tables[tableIndex];

            const multIndex = Math.floor(Math.random() * allowedMultipliers.length);
            b = allowedMultipliers[multIndex];

            id = `${a}-${b}`;
            attempts++;

            // Try to avoid the exact same question as the immediate last one
        } while (id === lastQuestionRef.current && attempts < 10);

        lastQuestionRef.current = id;

        return { id, a, b };
    }, []);

    const toggleTable = (table: number) => {
        if (selectedTables.includes(table)) {
            setSelectedTables(prev => prev.filter(t => t !== table));
        } else {
            setSelectedTables(prev => [...prev, table].sort((a, b) => a - b));
        }
    };

    const toggleAll = () => {
        if (selectedTables.length === 10) {
            setSelectedTables([]);
        } else {
            setSelectedTables([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        }
    };

    const startGame = () => {
        if (selectedTables.length === 0) return;
        setGameState('playing');
        setTimeLeft(GAME_DURATION_S);
        setScore(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
        setQuestionCount(0);
        lastQuestionRef.current = null;

        const firstQ = generateQuestion(selectedTables, timerEnabled ? GAME_DURATION_S : 0);
        setCurrentQuestion(firstQ);
    };

    useEffect(() => {
        if (gameState === 'playing' && timerEnabled && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (gameState === 'playing' && timerEnabled && timeLeft === 0) {
            setGameState('finished');
        }
        return () => clearTimeout(timerRef.current);
    }, [gameState, timeLeft, timerEnabled]);

    useEffect(() => {
        const saveResult = async () => {
            if (gameState === 'finished' && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const finalScore = timerEnabled ? score : Math.round((score / questionCount) * 100);
                
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'tables-multiplication',
                        score: finalScore
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'tables-multiplication',
                        score: finalScore,
                        details: sessionDetails,
                    });
                }
            }
        };
        saveResult();
    }, [gameState, student, score, hasBeenSaved, sessionDetails, isHomework, homeworkDate, timerEnabled, questionCount]);

    const [userInput, setUserInput] = useState('');

    const submitAnswer = (value: string, isCorrect: boolean) => {
        if (!currentQuestion) return;

        const correctAnswer = currentQuestion.a * currentQuestion.b;

        const detail: ScoreDetail = {
            question: `${currentQuestion.a} x ${currentQuestion.b}`,
            userAnswer: value,
            correctAnswer: String(correctAnswer),
            status: isCorrect ? 'correct' : 'incorrect',
        };
        setSessionDetails(prev => [...prev, detail]);

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }

        setQuestionCount(prev => prev + 1);

        setTimeout(() => {
            if (!timerEnabled && questionCount + 1 >= UNTIMED_QUESTIONS_COUNT) {
                setGameState('finished');
                return;
            }

            setFeedback(null);
            setUserInput('');
            // Generate next question based on NEW timeLeft (approximate, since we are inside closure, better to use ref or just pass current decr)
            // Actually `timeLeft` in closure might be stale if we don't depend on it, 
            // but for "progressive difficulty" rough estimate is enough.
            // Generate next question based on NEW timeLeft
            const nextQ = generateQuestion(selectedTables, timerEnabled ? timeLeft : 0);
            setCurrentQuestion(nextQ);
            inputRef.current?.focus();
        }, 500); // Fast transition
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!currentQuestion) return;
        const val = parseInt(userInput);
        if (isNaN(val)) return;
        const correctAnswer = currentQuestion.a * currentQuestion.b;
        submitAnswer(userInput, val === correctAnswer);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUserInput(val);

        if (!currentQuestion) return;
        const numVal = parseInt(val);
        const correctAnswer = currentQuestion.a * currentQuestion.b;

        if (numVal === correctAnswer) {
            submitAnswer(val, true);
        }
    };

    useEffect(() => {
        if (gameState === 'playing') {
            inputRef.current?.focus();
        }
    }, [gameState, currentQuestion]);

    const renderContent = () => {
        switch (gameState) {
            case 'setup':
                return (
                    <div className="text-center space-y-8 w-full max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">Quelles tables veux-tu réviser ?</h3>

                        <div className="flex justify-center mb-6">
                            <Button onClick={toggleAll} variant="secondary" size="sm">
                                {selectedTables.length === 10 ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <Button
                                    key={n}
                                    onClick={() => toggleTable(n)}
                                    variant={selectedTables.includes(n) ? "default" : "outline"}
                                    className={cn(
                                        "h-16 text-2xl font-bold transition-all",
                                        selectedTables.includes(n) ? "scale-105 shadow-md" : "opacity-70 hover:opacity-100"
                                    )}
                                >
                                    {n}
                                </Button>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center space-x-2 bg-secondary/20 p-4 rounded-lg">
                                <Checkbox 
                                    id="timer-enabled" 
                                    checked={timerEnabled} 
                                    onCheckedChange={(checked) => setTimerEnabled(checked === true)}
                                />
                                <Label htmlFor="timer-enabled" className="text-lg cursor-pointer">
                                    Chronomètre (1 minute)
                                </Label>
                            </div>

                            <Button
                                onClick={startGame}
                                size="lg"
                                className="text-xl px-12 py-6 rounded-xl animate-in zoom-in duration-300"
                                disabled={selectedTables.length === 0}
                            >
                                C'est parti !
                            </Button>
                        </div>
                    </div>
                );

            case 'playing':
                if (!currentQuestion) return null;
                return (
                    <div className="relative flex flex-col items-center gap-6 w-full max-w-md mx-auto pt-8">
                        {/* Timer or Progress */}
                        {timerEnabled ? (
                            <div className={cn(
                                "absolute top-0 right-0 text-3xl font-mono font-bold transition-all",
                                timeLeft <= 10 ? "text-red-500 scale-110 animate-pulse" : "text-muted-foreground"
                            )}>
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                        ) : (
                            <div className="absolute top-0 right-0 text-xl font-bold text-muted-foreground">
                                Question {questionCount + 1} / {UNTIMED_QUESTIONS_COUNT}
                            </div>
                        )}

                        <div className="text-8xl font-bold p-12 rounded-2xl bg-secondary/30 min-w-[300px] text-center mb-4">
                            {currentQuestion.a} x {currentQuestion.b}
                        </div>

                        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
                            <div className="relative w-full max-w-[200px]">
                                <input
                                    ref={inputRef}
                                    type="number"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    className={cn(
                                        "w-full text-center text-5xl p-4 rounded-lg border-4 focus:outline-none focus:ring-4 transition-all",
                                        feedback === 'correct' ? "border-green-500 bg-green-50 text-green-700" :
                                            feedback === 'incorrect' ? "border-red-500 bg-red-50 text-red-700" :
                                                "border-primary/20 focus:border-primary focus:ring-primary/20"
                                    )}
                                    placeholder="?"
                                    autoFocus
                                    disabled={!!feedback}
                                />
                                {feedback && (
                                    <div className="absolute top-1/2 -translate-y-1/2 right-4">
                                        {feedback === 'correct' ?
                                            <Check className="h-8 w-8 text-green-600" /> :
                                            <X className="h-8 w-8 text-red-600" />
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 w-full max-w-[200px]">
                                <Button type="submit" size="lg" className="flex-grow text-lg" disabled={!userInput || !!feedback}>
                                    Valider
                                </Button>
                                {!timerEnabled && (
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="lg" 
                                        onClick={() => setGameState('finished')}
                                        className="px-3"
                                        title="Terminer la session"
                                    >
                                        <Square className="h-5 w-5 fill-current" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                );

            case 'finished':
                return (
                    <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-4xl font-bold text-primary">Temps écoulé !</h2>
                        <div className="py-8 bg-muted/20 rounded-xl max-w-sm mx-auto">
                            <p className="text-2xl text-muted-foreground mb-2">Ton score</p>
                            <div className="flex items-baseline justify-center gap-2">
                                <p className="text-8xl font-bold text-primary">{score}</p>
                                {!timerEnabled && (
                                    <p className="text-4xl text-muted-foreground">/ {UNTIMED_QUESTIONS_COUNT}</p>
                                )}
                            </div>
                            <p className="text-lg text-muted-foreground mt-2">bonnes réponses</p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                            <Button onClick={() => setGameState('setup')} size="lg" variant="outline" className="text-lg px-8 h-16">
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Changer de tables
                            </Button>
                            <Button onClick={startGame} size="lg" className="text-lg px-8 h-16">
                                <Play className="mr-2 h-5 w-5" />
                                Rejouer
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-xl border-2">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-center text-3xl font-headline flex items-center justify-center gap-3">
                    Tables de Multiplication
                    {gameState !== 'setup' && selectedTables.length > 0 && (
                        <span className="text-sm font-normal py-1 px-3 bg-primary/10 rounded-full text-primary hidden sm:inline-block">
                            Tables : {selectedTables.join(', ')}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[500px] flex flex-col justify-center items-center p-4 sm:p-8">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
