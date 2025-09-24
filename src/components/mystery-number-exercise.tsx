
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, RefreshCw, Check, X, HelpCircle, ThumbsUp } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from './ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '@/lib/skills';

const NUM_QUESTIONS = 5;

type Clue = {
    id: string;
    text: string;
    isRevealed: boolean;
};

// Helper function to generate a random number within a digit range
const generateNumberByDigits = (minDigits: number, maxDigits: number): number => {
    const digits = Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to get digit name
const getDigitName = (position: number, length: number): string => {
    const names = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de milliers', 'centaines de milliers', 'millions', 'dizaines de millions'];
    return names[position] || `position ${position}`;
};


export function MysteryNumberExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');
    const [level, setLevel] = useState<SkillLevel>('B');

    const [gameState, setGameState] = useState<'generating' | 'playing' | 'feedback' | 'finished'>('generating');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [mysteryNumber, setMysteryNumber] = useState(0);
    const [clues, setClues] = useState<Clue[]>([]);
    const [revealedClueCount, setRevealedClueCount] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [errorHint, setErrorHint] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (student?.levels?.['mystery-number']) {
            setLevel(student.levels['mystery-number']);
        }
    }, [student]);

    useEffect(() => {
        generateNewProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex, level]);

    useEffect(() => {
        // Reveal one clue at a time
        if (gameState === 'playing' && revealedClueCount < clues.length) {
            const timer = setTimeout(() => {
                setRevealedClueCount(prev => prev + 1);
            }, 2000); // Reveal a new clue every 2 seconds
            return () => clearTimeout(timer);
        }
    }, [gameState, revealedClueCount, clues]);

    const generateNewProblem = () => {
        setGameState('generating');
        let num: number;
        switch (level) {
            case 'B': num = generateNumberByDigits(2, 3); break;
            case 'C': num = generateNumberByDigits(3, 5); break;
            case 'D': num = generateNumberByDigits(4, 8); break;
            default: num = generateNumberByDigits(2, 3);
        }
        setMysteryNumber(num);
        const numStr = String(num);
        const generatedClues = numStr.split('').map((digit, index) => {
            const position = numStr.length - 1 - index;
            return {
                id: `${currentQuestionIndex}-${position}`,
                text: `Mon chiffre des ${getDigitName(position, numStr.length)} est ${digit}.`,
                isRevealed: false
            };
        }).reverse(); // Start with units
        
        setClues(generatedClues);
        setRevealedClueCount(1); // Reveal first clue immediately
        setUserInput('');
        setAttempts(0);
        setErrorHint(null);
        setGameState('playing');
    };

    const getScoreFromAttempts = (attemptCount: number): number => {
        if (attemptCount === 1) return 100;
        if (attemptCount === 2) return 75;
        if (attemptCount === 3) return 50;
        if (attemptCount === 4) return 25;
        return 15;
    };
    
    const handleSubmit = () => {
        if (!userInput) return;
        
        const currentAttempts = attempts + 1;
        setAttempts(currentAttempts);
        const isCorrect = parseInt(userInput, 10) === mysteryNumber;

        if (isCorrect) {
            setShowConfetti(true);
            setGameState('feedback');
            const score = getScoreFromAttempts(currentAttempts);
            const detail: ScoreDetail = {
                question: `Deviner le nombre mystère (${mysteryNumber})`,
                userAnswer: userInput,
                correctAnswer: String(mysteryNumber),
                status: 'correct',
                score: score,
            };
            setSessionDetails(prev => [...prev, detail]);
            setTimeout(() => {
                setShowConfetti(false);
                if (currentQuestionIndex < NUM_QUESTIONS - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                } else {
                    setGameState('finished');
                }
            }, 3000);
        } else {
            // Provide a hint
            const userNumStr = userInput;
            const mysteryNumStr = String(mysteryNumber);
            let hint = "Ce n'est pas ça, essaie encore.";
            if(userNumStr.length !== mysteryNumStr.length) {
                hint = `Le nombre mystère a ${mysteryNumStr.length} chiffres.`;
            } else {
                 for(let i = 0; i < mysteryNumStr.length; i++) {
                    if (userNumStr[i] !== mysteryNumStr[i]) {
                         const position = mysteryNumStr.length - 1 - i;
                         hint = `Vérifie le chiffre des ${getDigitName(position, mysteryNumStr.length)}.`;
                         break;
                    }
                }
            }
            setErrorHint(hint);
        }
    };
    
    useEffect(() => {
        const saveFinalScore = async () => {
            if (gameState === 'finished' && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const totalScore = sessionDetails.reduce((acc, detail) => acc + (detail.score || 0), 0);
                const finalScore = sessionDetails.length > 0 ? totalScore / sessionDetails.length : 0;
                
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({ userId: student.id, date: homeworkDate, skillSlug: 'mystery-number', score: finalScore });
                } else {
                    await addScore({ userId: student.id, skill: 'mystery-number', score: finalScore, details: sessionDetails, numberLevelSettings: { level } });
                }
            }
        };
        saveFinalScore();
    }, [gameState, student, hasBeenSaved, sessionDetails, level, isHomework, homeworkDate]);

    if (gameState === 'generating') {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
    }
    
    if (gameState === 'finished') {
        const totalScore = sessionDetails.reduce((acc, detail) => acc + (detail.score || 0), 0);
        const finalScore = sessionDetails.length > 0 ? totalScore / sessionDetails.length : 0;
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-6">
                <CardHeader>
                    <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">Ton score moyen est de {Math.round(finalScore)}%.</p>
                    <ScoreTube score={finalScore} />
                    <Button onClick={() => setCurrentQuestionIndex(0)} variant="outline" size="lg">
                        <RefreshCw className="mr-2" /> Recommencer
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">Quel est le nombre mystère ?</CardTitle>
                <Progress value={((currentQuestionIndex + 1) / NUM_QUESTIONS) * 100} className="w-full mt-4 h-3" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[300px]">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={cn("relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-500", gameState === 'feedback' && 'scale-110')}>
                         {gameState === 'feedback' ? (
                            <span className="font-bold text-6xl sm:text-7xl text-primary animate-in fade-in zoom-in-125 duration-500">{mysteryNumber}</span>
                        ) : (
                            <HelpCircle className="w-24 h-24 text-primary/50" />
                        )}
                    </div>
                </div>
                <div className="space-y-3">
                    <CardDescription>Indices :</CardDescription>
                    {clues.map((clue, index) => (
                         <p key={clue.id} className={cn("text-lg font-medium transition-all duration-500", index < revealedClueCount ? 'opacity-100' : 'opacity-0')}>
                            - {clue.text}
                         </p>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                 <div className="relative w-full max-w-sm">
                    <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ta réponse"
                        value={userInput}
                        onChange={(e) => { setUserInput(e.target.value.replace(/[^0-9]/g, '')); setErrorHint(null); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        className="h-16 text-3xl text-center font-bold"
                        disabled={gameState === 'feedback'}
                    />
                </div>
                <Button onClick={handleSubmit} size="lg" disabled={!userInput || gameState === 'feedback'}>
                    <Check className="mr-2" /> Valider
                </Button>
                {errorHint && <p className="text-destructive font-semibold text-sm">{errorHint}</p>}
                {gameState === 'feedback' && (
                    <div className="text-center text-green-600 font-bold text-xl flex items-center gap-2 animate-pulse">
                        <ThumbsUp /> Bravo ! C'était bien {mysteryNumber}.
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
