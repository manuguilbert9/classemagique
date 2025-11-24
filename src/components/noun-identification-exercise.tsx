'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, X, Loader2, ThumbsUp, Info } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { NOUN_SENTENCES } from '@/data/grammaire/nouns-sentences';
import { NOUN_PHRASES } from '@/data/grammaire/nouns-phrases';
import { cn } from '@/lib/utils';
import { SkillLevel } from '@/lib/skills';

const NUM_QUESTIONS = 10;

interface Token {
    id: string;
    text: string;
    isNoun: boolean;
    cleanText: string;
}

export function NounIdentificationExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [level, setLevel] = useState<SkillLevel>('B');
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [sentenceTokens, setSentenceTokens] = useState<Token[]>([]);
    const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(new Set());

    // Game state
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    useEffect(() => {
        if (student?.levels?.['reperer-nom']) {
            setLevel(student.levels['reperer-nom']);
        }
    }, [student]);

    // Initialize questions
    useEffect(() => {
        // Shuffle and pick NUM_QUESTIONS
        const sourceData = level === 'B' ? NOUN_PHRASES : NOUN_SENTENCES;
        const shuffled = [...sourceData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, NUM_QUESTIONS));
    }, [level]);

    // Parse sentence into tokens
    const parseSentence = useCallback((sentence: string) => {
        // Split by spaces, but also handle apostrophes as separators while keeping them attached to the first part if possible, 
        // or just treat them as separate tokens.
        // Strategy: 
        // 1. Replace [word] with special markers to track them.
        // 2. Split by spaces.
        // 3. Handle apostrophes: "L'[avion]" -> "L'" "[avion]"

        // Actually, a regex match is better.
        // We want to capture:
        // - Words in brackets: \[.*?\]
        // - Words with apostrophes: \w+'
        // - Normal words: \w+
        // - Punctuation: [.,!?;:]

        // Let's try a simpler approach:
        // 1. Split by space.
        // 2. For each part, check if it contains an apostrophe. If so, split it.

        const rawTokens = sentence.split(/\s+/);
        const tokens: Token[] = [];
        let idCounter = 0;

        rawTokens.forEach(rawToken => {
            // Handle "L'[avion]" or "d'[eau]"
            // Regex to find apostrophe split: (something') (rest)
            const apostropheMatch = rawToken.match(/^(.+')(.+)$/);

            if (apostropheMatch) {
                // Part 1: L'
                const part1 = apostropheMatch[1];
                tokens.push({
                    id: `token-${idCounter++}`,
                    text: part1,
                    isNoun: false,
                    cleanText: part1
                });

                // Part 2: [avion] or [avion].
                const part2 = apostropheMatch[2];
                processToken(part2, tokens, idCounter++);
            } else {
                processToken(rawToken, tokens, idCounter++);
            }
        });

        setSentenceTokens(tokens);
        setSelectedTokenIds(new Set());
    }, []);

    const processToken = (raw: string, tokens: Token[], id: number) => {
        // Check if it's a noun (surrounded by [])
        // It might have punctuation at the end: [chat].
        const nounMatch = raw.match(/^\[(.*?)\]([.,!?;:]*)$/);
        const nounStartMatch = raw.match(/^\[(.*?)$/); // Case where split failed? Unlikely with spaces.

        if (nounMatch) {
            // It is a noun: [chat] or [chat].
            const word = nounMatch[1];
            const punct = nounMatch[2];

            tokens.push({
                id: `token-${id}`,
                text: word,
                isNoun: true,
                cleanText: word
            });

            if (punct) {
                tokens.push({
                    id: `token-${id}-punct`,
                    text: punct,
                    isNoun: false,
                    cleanText: punct
                });
            }
        } else {
            // Not a noun, but might have punctuation
            // "mange." -> "mange" + "."
            const punctMatch = raw.match(/^(.+?)([.,!?;:]+)$/);
            if (punctMatch) {
                tokens.push({
                    id: `token-${id}`,
                    text: punctMatch[1],
                    isNoun: false,
                    cleanText: punctMatch[1]
                });
                tokens.push({
                    id: `token-${id}-punct`,
                    text: punctMatch[2],
                    isNoun: false,
                    cleanText: punctMatch[2]
                });
            } else {
                // Just a word
                tokens.push({
                    id: `token-${id}`,
                    text: raw,
                    isNoun: false,
                    cleanText: raw
                });
            }
        }
    };

    useEffect(() => {
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
            parseSentence(questions[currentQuestionIndex]);
        }
    }, [questions, currentQuestionIndex, parseSentence]);

    const handleTokenClick = (id: string) => {
        if (feedback) return; // Disable interaction during feedback

        // Find the token to ensure it's not punctuation (optional, but good UX)
        const token = sentenceTokens.find(t => t.id === id);
        if (!token || /^[.,!?;:]+$/.test(token.text)) return;

        setSelectedTokenIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const checkAnswer = () => {
        if (feedback) return;

        const nounIds = new Set(sentenceTokens.filter(t => t.isNoun).map(t => t.id));

        // Check if selected match nouns exactly
        const selectedArray = Array.from(selectedTokenIds);
        const isCorrect = selectedArray.length === nounIds.size && selectedArray.every(id => nounIds.has(id));

        const currentSentenceClean = sentenceTokens.map(t => t.text).join(' ');
        const nouns = sentenceTokens.filter(t => t.isNoun).map(t => t.text).join(', ');

        const detail: ScoreDetail = {
            question: `Trouve les noms : "${currentSentenceClean}"`,
            userAnswer: sentenceTokens.filter(t => selectedTokenIds.has(t.id)).map(t => t.text).join(', '),
            correctAnswer: nouns,
            status: isCorrect ? 'correct' : 'incorrect',
        };
        setSessionDetails(prev => [...prev, detail]);

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
            setFeedback('correct');
            setShowConfetti(true);
        } else {
            setFeedback('incorrect');
            // Auto-select correct answers to show them
            setSelectedTokenIds(nounIds);
        }

        setTimeout(handleNextQuestion, 2500);
    };

    const handleNextQuestion = () => {
        setShowConfetti(false);
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };

    const restartExercise = () => {
        const shuffled = [...NOUN_SENTENCES].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, NUM_QUESTIONS));
        setCurrentQuestionIndex(0);
        setFeedback(null);
        setIsFinished(false);
        setCorrectAnswers(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
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
                        skillSlug: 'reperer-nom',
                        score: score
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'reperer-nom',
                        score: score,
                        details: sessionDetails,
                    });
                }
            }
        };
        saveResult();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    if (questions.length === 0) {
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
                        Tu as trouvé les noms dans <span className="font-bold text-primary">{correctAnswers}</span> phrases sur <span className="font-bold">{NUM_QUESTIONS}</span>.
                    </p>
                    <ScoreTube score={score} />
                    <Button onClick={restartExercise} variant="outline" size="lg" className="mt-4"><RefreshCw className="mr-2" />Recommencer</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center">Repère les noms</CardTitle>
                <CardDescription className="text-center text-lg">
                    Clique sur tous les <span className="font-bold text-primary">noms</span> dans la phrase.
                </CardDescription>
                <Progress value={((currentQuestionIndex) / NUM_QUESTIONS) * 100} className="w-full mt-4 h-3" />
            </CardHeader>
            <CardContent className="min-h-[200px] flex flex-col items-center justify-center gap-8 p-6">

                <div className="flex flex-wrap justify-center gap-3 text-2xl leading-loose">
                    {sentenceTokens.map((token) => (
                        <button
                            key={token.id}
                            onClick={() => handleTokenClick(token.id)}
                            disabled={!!feedback}
                            className={cn(
                                "px-3 py-1 rounded-lg transition-all duration-200 border-2",
                                // Default state
                                !selectedTokenIds.has(token.id) && "border-transparent hover:bg-muted",
                                // Selected state
                                selectedTokenIds.has(token.id) && !feedback && "bg-primary/10 border-primary text-primary font-bold transform scale-105",
                                // Correct feedback (for correct nouns)
                                feedback === 'correct' && token.isNoun && "bg-green-100 border-green-500 text-green-700 font-bold",
                                // Incorrect feedback (missed nouns)
                                feedback === 'incorrect' && token.isNoun && !selectedTokenIds.has(token.id) && "bg-green-100 border-green-500 text-green-700 font-bold border-dashed",
                                // Incorrect feedback (wrongly selected)
                                feedback === 'incorrect' && !token.isNoun && selectedTokenIds.has(token.id) && "bg-red-100 border-red-500 text-red-700 line-through",
                                // Punctuation (non-interactive look)
                                /^[.,!?;:]+$/.test(token.text) && "cursor-default hover:bg-transparent border-transparent px-0"
                            )}
                        >
                            {token.text}
                        </button>
                    ))}
                </div>

            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6">
                <Button size="lg" onClick={checkAnswer} disabled={!!feedback || selectedTokenIds.size === 0} className="text-xl px-8">
                    <Check className="mr-2 h-6 w-6" /> Valider
                </Button>

                {feedback === 'correct' && (
                    <div className="text-xl font-bold text-green-600 flex items-center gap-2 animate-pulse">
                        <ThumbsUp className="h-6 w-6" /> Bravo !
                    </div>
                )}
                {feedback === 'incorrect' && (
                    <div className="text-xl font-bold text-red-600 flex items-center gap-2 animate-shake">
                        <Info className="h-6 w-6" /> Regarde la correction.
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
