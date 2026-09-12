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
import type { PhraseAReperer } from '@/lib/exercise-content/grammaire';
import { getPooledContent } from '@/services/exercise-pool';
import {
    DELAI_NOUVEL_ESSAI,
  AnswerFeedback,
    ExerciseFinished,
    ExerciseProgress,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';
import { cn } from '@/lib/utils';
import { SkillLevel } from '@/lib/skills';

const NUM_QUESTIONS = 10;

interface Token {
    id: string;
    text: string;
    isTarget: boolean; // Adjective
    isNoun: boolean;   // Noun (for Level B hint)
    cleanText: string;
}

export function AdjectiveIdentificationExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [level, setLevel] = useState<SkillLevel>('B');
    const [sentenceTokens, setSentenceTokens] = useState<Token[]>([]);
    const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(new Set());

    // Game state
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    const secondChance = useSecondChance();
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    useEffect(() => {
        if (student?.levels?.['reperer-adjectif']) {
            setLevel(student.levels['reperer-adjectif']);
        }
    }, [student]);

    // Les phrases viennent du stock partagé : à niveau égal, toute la classe
    // travaille sur les mêmes.
    const loadQuestions = useCallback(async () => {
        const phrases = await getPooledContent<PhraseAReperer>('reperer-adjectif', NUM_QUESTIONS, {
            settings: { level },
            studentId: student?.id ?? null,
        });
        setQuestions(phrases.map((p) => p.phrase));
    }, [level, student?.id]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    // Parse sentence into tokens
    const parseSentence = useCallback((sentence: string) => {
        const rawTokens = sentence.split(/\s+/);
        const tokens: Token[] = [];
        let idCounter = 0;

        rawTokens.forEach(rawToken => {
            // Handle "L'[avion]" or "d'{eau}"
            const apostropheMatch = rawToken.match(/^(.+')(.+)$/);

            if (apostropheMatch) {
                const part1 = apostropheMatch[1];
                tokens.push({
                    id: `token-${idCounter++}`,
                    text: part1,
                    isTarget: false,
                    isNoun: false,
                    cleanText: part1
                });

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
        // Check if it's a target (adjective) [word]
        const targetMatch = raw.match(/^\[(.*?)\]([.,!?;:]*)$/);
        // Check if it's a noun {word}
        const nounMatch = raw.match(/^\{(.*?)\}([.,!?;:]*)$/);

        if (targetMatch) {
            const word = targetMatch[1];
            const punct = targetMatch[2];

            tokens.push({
                id: `token-${id}`,
                text: word,
                isTarget: true,
                isNoun: false,
                cleanText: word
            });

            if (punct) {
                tokens.push({
                    id: `token-${id}-punct`,
                    text: punct,
                    isTarget: false,
                    isNoun: false,
                    cleanText: punct
                });
            }
        } else if (nounMatch) {
            const word = nounMatch[1];
            const punct = nounMatch[2];

            tokens.push({
                id: `token-${id}`,
                text: word,
                isTarget: false,
                isNoun: true,
                cleanText: word
            });

            if (punct) {
                tokens.push({
                    id: `token-${id}-punct`,
                    text: punct,
                    isTarget: false,
                    isNoun: false,
                    cleanText: punct
                });
            }
        } else {
            const punctMatch = raw.match(/^(.+?)([.,!?;:]+)$/);
            if (punctMatch) {
                tokens.push({
                    id: `token-${id}`,
                    text: punctMatch[1],
                    isTarget: false,
                    isNoun: false,
                    cleanText: punctMatch[1]
                });
                tokens.push({
                    id: `token-${id}-punct`,
                    text: punctMatch[2],
                    isTarget: false,
                    isNoun: false,
                    cleanText: punctMatch[2]
                });
            } else {
                tokens.push({
                    id: `token-${id}`,
                    text: raw,
                    isTarget: false,
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
        if (feedback) return;

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

        const targetIds = new Set(sentenceTokens.filter(t => t.isTarget).map(t => t.id));

        const selectedArray = Array.from(selectedTokenIds);
        const isCorrect = selectedArray.length === targetIds.size && selectedArray.every(id => targetIds.has(id));

        const currentSentenceClean = sentenceTokens.map(t => t.text).join(' ');
        const targets = sentenceTokens.filter(t => t.isTarget).map(t => t.text).join(', ');

        const issue = secondChance.resultOnSuccess();
        const detail: ScoreDetail = {
            question: `Trouve les adjectifs : "${currentSentenceClean}"`,
            userAnswer: sentenceTokens.filter(t => selectedTokenIds.has(t.id)).map(t => t.text).join(', '),
            correctAnswer: targets,
            status: issue,
        };

        // Faux : la sélection de l'élève reste à l'écran, il la corrige
        // lui-même. Rien n'est enregistré tant qu'il n'a pas trouvé.
        if (!isCorrect) {
            secondChance.registerError();
            setFeedback('retry');
            setTimeout(() => setFeedback(null), DELAI_NOUVEL_ESSAI);
            return;
        }

        setSessionDetails(prev => [...prev, detail]);
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
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };

    const restartExercise = async () => {
        await loadQuestions();
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
                        skillSlug: 'reperer-adjectif',
                        score: score
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'reperer-adjectif',
                        score: score,
                        details: sessionDetails,
                        numberLevelSettings: { level }
                    });
                }
            }
        };
        saveResult();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate, level]);

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
        <Card className="w-full max-w-3xl mx-auto shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center">Repère les adjectifs</CardTitle>
                <CardDescription className="text-center text-lg">
                    Clique sur tous les <span className="font-bold text-primary">adjectifs</span> dans la phrase.
                    {level === 'B' && <span className="block text-sm text-muted-foreground mt-2">(Aide : Les noms sont en bleu pour t'aider)</span>}
                </CardDescription>
                <ExerciseProgress current={currentQuestionIndex} total={NUM_QUESTIONS} results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')} className="mt-4" />
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

                                // Level B Hint: Nouns are blue
                                level === 'B' && token.isNoun && !selectedTokenIds.has(token.id) && !feedback && "text-blue-600 font-medium",

                                // Selected state
                                selectedTokenIds.has(token.id) && !feedback && "bg-primary/10 border-primary text-primary font-bold transform scale-105",

                                // Correct feedback (for correct adjectives)
                                (feedback === 'correct' || feedback === 'corrected') && token.isTarget && "bg-green-100 border-green-500 text-green-700 font-bold",

                                // Incorrect feedback (missed adjectives)
                                secondChance.showHint && token.isTarget && !selectedTokenIds.has(token.id) && "bg-green-100 border-green-500 text-green-700 font-bold border-dashed",

                                // Incorrect feedback (wrongly selected)
                                feedback === 'retry' && !token.isTarget && selectedTokenIds.has(token.id) && "bg-red-100 border-red-500 text-red-700 line-through",

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

                <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full">
                    {feedback === 'correct'
                        ? 'Bravo, tu les as tous trouvés !'
                        : 'Regarde la correction : en vert ce qu\u2019il fallait cliquer, en rouge ce qui est en trop.'}
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
