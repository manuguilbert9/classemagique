'use client';

import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { Check, RefreshCw, X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';

const GAME_DURATION_S = 120; // 2 minutes

type Level = 'A' | 'B' | 'C' | 'D';

interface SubtractionQuestion {
    id: string;
    a: number;
    b: number;
}

export function MentalSubtractionExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
    const [currentQuestion, setCurrentQuestion] = useState<SubtractionQuestion | null>(null);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [viewedQuestions, setViewedQuestions] = useState<Set<string>>(new Set());

    const timerRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);

    const generateQuestion = useCallback((level: Level): SubtractionQuestion => {
        let a = 0, b = 0;
        let id = '';
        let attempts = 0;

        do {
            switch (level) {
                case 'A':
                    // On soustrait 1 ou 2 à un nombre inférieur à 15 (résultat >= 0)
                    a = Math.floor(Math.random() * 16); // 0 to 15
                    b = Math.random() > 0.5 ? 1 : 2;
                    // Ensure valid subtraction
                    if (a < b) a = b + Math.floor(Math.random() * 10);
                    break;
                case 'B':
                    // On soustrait un nombre inférieur à 6 à un nombre inférieur à 30
                    a = Math.floor(Math.random() * 31); // 0 to 30
                    b = Math.floor(Math.random() * 6); // 0 to 5 (inférieur à 6 means < 6, so 0-5)
                    // Ensure b >= 0 (random already ensures >= 0)
                    // Request says "inférieur à 6", conventionally strictly < 6 involves 1-5 usually in mental math context, but 0 is trivial. Let's assume 1-5.
                    b = Math.floor(Math.random() * 5) + 1;
                    if (a < b) a = b + Math.floor(Math.random() * 20);
                    break;
                case 'C':
                    // On soustrait un nombre inférieur à 11 à un nombre inférieur à 50
                    a = Math.floor(Math.random() * 51); // 0 to 50
                    b = Math.floor(Math.random() * 10) + 1; // 1 to 10
                    if (a < b) a = b + Math.floor(Math.random() * 30);
                    break;
                case 'D':
                    // On soustrait un nombre inférieur à 15 à un nombre inférieur à 100
                    a = Math.floor(Math.random() * 101); // 0 to 100
                    b = Math.floor(Math.random() * 14) + 1; // 1 to 14
                    if (a < b) a = b + Math.floor(Math.random() * 50);
                    break;
            }
            id = `${a}-${b}`;
            attempts++;
        } while (viewedQuestions.has(id) && attempts < 50); // Avoid duplicates, give up after 50 tries to avoid infinite loop

        return { id, a, b };
    }, [viewedQuestions]);

    const handleLevelSelect = (level: Level) => {
        setSelectedLevel(level);
        setGameState('playing');
        setTimeLeft(GAME_DURATION_S);
        setScore(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
        setViewedQuestions(new Set());

        const firstQ = generateQuestion(level);
        setCurrentQuestion(firstQ);
        setViewedQuestions(new Set([firstQ.id]));
    };

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (gameState === 'playing' && timeLeft === 0) {
            setGameState('finished');
        }
        return () => clearTimeout(timerRef.current);
    }, [gameState, timeLeft]);

    useEffect(() => {
        const saveResult = async () => {
            if (gameState === 'finished' && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'soustraction-mentale',
                        score: score
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'soustraction-mentale',
                        score: score,
                        details: sessionDetails,
                    });
                }
            }
        };
        saveResult();
    }, [gameState, student, score, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    // Keyboard input handling remains similar but adapted for typing full numbers (since answer can be > 9)
    // Actually, for this exercise, users might need to type multiple digits.
    // The previous exercise 'ComplementDixExercise' used single key press because answers were 0-9 single digits usually?
    // Wait, Complement to 10: 10-X is single digit.
    // Here: 100 - 15 = 85. We definitely need an input field, not just global keydown.
    // BUT the prompt says "Comme pour les compléments à 10". 
    // ComplementDixExercise allows single digit input via global keypress.
    // IF the answer is multi-digit, we can't use that simple logic.
    // Let's implement a real input field that autofocuses.

    const [userInput, setUserInput] = useState('');

    const checkAnswer = (value: string) => {
        if (!currentQuestion || !selectedLevel) return;

        const val = parseInt(value);
        if (isNaN(val)) return;

        const correctAnswer = currentQuestion.a - currentQuestion.b;
        const isCorrect = val === correctAnswer;

        // If auto-checking (from onChange), only validate if correct
        // If from submit (Enter), validate whatever
        // Actually, for this specific request "Lorsque la bonne réponse est écrite la réponse est validée",
        // we essentially want: if correct -> submit.
        // If incorrect -> do nothing (wait for more input or Enter).
        // BUT if the user presses Enter, we should show feedback even if incorrect.

        // Let's distinguish context?
        // Actually, the request implies "don't force Enter".
        // Use case:
        // 1. User types correct answer -> Auto triggers.
        // 2. User types incorrect answer -> Nothing happens.
        // 3. User types incorrect answer AND presses Enter -> Shows error.

        // This function will be called by handleSubmit (force check) and handleChange (auto check if match).

        if (isCorrect) {
            submitAnswer(value, true);
        }
    };

    const submitAnswer = (value: string, isCorrect: boolean) => {
        if (!currentQuestion) return;

        const correctAnswer = currentQuestion.a - currentQuestion.b;

        const detail: ScoreDetail = {
            question: `${currentQuestion.a} - ${currentQuestion.b}`,
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

        setTimeout(() => {
            setFeedback(null);
            setUserInput('');
            const nextQ = generateQuestion(selectedLevel!);
            setCurrentQuestion(nextQ);
            setViewedQuestions(prev => {
                const newSet = new Set(prev);
                newSet.add(nextQ.id);
                return newSet;
            });
            // Keep focus
            inputRef.current?.focus();
        }, 500);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        // Force submit whatever is there
        if (!currentQuestion) return;
        const val = parseInt(userInput);
        if (isNaN(val)) return;
        const correctAnswer = currentQuestion.a - currentQuestion.b;
        submitAnswer(userInput, val === correctAnswer);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUserInput(val);

        if (!currentQuestion) return;
        const numVal = parseInt(val);
        const correctAnswer = currentQuestion.a - currentQuestion.b;

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
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">Choisis ton niveau :</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                                <Button onClick={() => handleLevelSelect('A')} variant="outline" className="h-24 text-lg flex flex-col gap-2 hover:bg-green-50 hover:border-green-500">
                                    <span className="font-bold text-2xl">Niveau A</span>
                                    <span className="text-sm font-normal text-muted-foreground">-1 ou -2 (max 15)</span>
                                </Button>
                                <Button onClick={() => handleLevelSelect('B')} variant="outline" className="h-24 text-lg flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-500">
                                    <span className="font-bold text-2xl">Niveau B</span>
                                    <span className="text-sm font-normal text-muted-foreground">- (1 à 5) (max 30)</span>
                                </Button>
                                <Button onClick={() => handleLevelSelect('C')} variant="outline" className="h-24 text-lg flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-500">
                                    <span className="font-bold text-2xl">Niveau C</span>
                                    <span className="text-sm font-normal text-muted-foreground">- (1 à 10) (max 50)</span>
                                </Button>
                                <Button onClick={() => handleLevelSelect('D')} variant="outline" className="h-24 text-lg flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-500">
                                    <span className="font-bold text-2xl">Niveau D</span>
                                    <span className="text-sm font-normal text-muted-foreground">- (1 à 14) (max 100)</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 'playing':
                if (!currentQuestion) return null;
                return (
                    <div className="relative flex flex-col items-center gap-6 w-full max-w-md mx-auto pt-12">
                        {/* Timer */}
                        <div className={cn(
                            "absolute top-0 right-0 text-2xl font-mono font-bold transition-all",
                            timeLeft <= 10 ? "text-red-500 scale-110 animate-pulse" : "text-muted-foreground"
                        )}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <div className="text-8xl font-bold p-12 rounded-2xl bg-secondary/30 min-w-[300px] text-center">
                            {currentQuestion.a} - {currentQuestion.b}
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
                            <Button type="submit" size="lg" className="w-full max-w-[200px] text-lg" disabled={!userInput || !!feedback}>
                                Valider
                            </Button>
                        </form>
                    </div>
                );

            case 'finished':
                return (
                    <div className="text-center space-y-6">
                        <h2 className="text-4xl font-bold text-primary">Temps écoulé !</h2>
                        <div className="py-8">
                            <p className="text-2xl text-muted-foreground mb-2">Ton score</p>
                            <p className="text-8xl font-bold text-primary">{score}</p>
                            <p className="text-lg text-muted-foreground mt-2">bonnes réponses</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => setGameState('setup')} size="lg" variant="outline" className="text-lg px-8">
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Changer de niveau
                            </Button>
                            <Button onClick={() => handleLevelSelect(selectedLevel!)} size="lg" className="text-lg px-8">
                                <Play className="mr-2 h-5 w-5" />
                                Rejouer ce niveau
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
                    Reflexe Soustraction
                    {selectedLevel && <span className="text-lg font-normal py-1 px-3 bg-primary/10 rounded-full text-primary">Niveau {selectedLevel}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px] flex flex-col justify-center items-center p-8">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
