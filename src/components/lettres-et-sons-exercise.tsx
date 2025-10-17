
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
import { syllableAttackData } from '@/lib/syllable-data'; // Re-using data for word variety

const NUM_QUESTIONS = 10;

interface WordOption {
    word: string;
    isCorrect: boolean;
}

interface SoundQuestion {
    sound: string;
    options: WordOption[];
}

function generateQuestion(): SoundQuestion {
    // Helper function to shuffle array
    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Get all unique sounds that have at least 2 words
    const soundCounts = new Map<string, number>();
    syllableAttackData.forEach(item => {
        soundCounts.set(item.sound, (soundCounts.get(item.sound) || 0) + 1);
    });

    const validSounds = Array.from(soundCounts.entries())
        .filter(([_, count]) => count >= 2)
        .map(([sound, _]) => sound);

    // Select a random sound from valid sounds only
    const selectedSound = validSounds[Math.floor(Math.random() * validSounds.length)];

    // Get all words with that sound and shuffle
    const allCorrectWords = syllableAttackData.filter(d => d.sound === selectedSound);
    const shuffledCorrectWords = shuffleArray(allCorrectWords);
    const correctWords = shuffledCorrectWords.slice(0, 2);

    // Get all words WITHOUT that sound and shuffle
    const allIncorrectWords = syllableAttackData.filter(d => d.sound !== selectedSound);
    const shuffledIncorrectWords = shuffleArray(allIncorrectWords);
    const incorrectWords = shuffledIncorrectWords.slice(0, 2);

    const options: WordOption[] = [
        ...correctWords.map(w => ({ word: w.word, isCorrect: true })),
        ...incorrectWords.map(w => ({ word: w.word, isCorrect: false }))
    ];

    // Shuffle options
    const shuffledOptions = shuffleArray(options);

    return { sound: selectedSound, options: shuffledOptions };
}

export function LettresEtSonsExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [questions, setQuestions] = useState<SoundQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    useEffect(() => {
        const newQuestions = Array.from({ length: NUM_QUESTIONS }, generateQuestion);
        setQuestions(newQuestions);
    }, []);

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    const handleSpeak = useCallback((text: string) => {
        if (!text || !('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, []);

    const handleNextQuestion = () => {
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

        const detail: ScoreDetail = {
            question: `Identifier les mots avec le son [${currentQuestion.sound}]`,
            userAnswer: selectedWords.join(', '),
            correctAnswer: correctOptions.join(', '),
            status: isCorrect ? 'correct' : 'incorrect',
        };
        setSessionDetails(prev => [...prev, detail]);

        if (isCorrect) {
            setFeedback('correct');
            setCorrectAnswersCount(prev => prev + 1);
            setShowConfetti(true);
        } else {
            setFeedback('incorrect');
        }
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

    const restartExercise = () => {
        setQuestions(Array.from({ length: NUM_QUESTIONS }, generateQuestion));
        setIsFinished(false);
        setCorrectAnswersCount(0);
        setCurrentQuestionIndex(0);
        setSelectedWords([]);
        setFeedback(null);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };
    
    if (questions.length === 0) {
        return <div>Chargement...</div>
    }

    if (isFinished) {
        const score = (correctAnswersCount / NUM_QUESTIONS) * 100;
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
                <CardHeader>
                    <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as obtenu <span className="font-bold text-primary">{correctAnswersCount}</span> bonnes réponses sur <span className="font-bold">{NUM_QUESTIONS}</span>.
                    </p>
                    <ScoreTube score={score} />
                    {isHomework ? (
                        <p className="text-muted-foreground">Tes devoirs sont terminés !</p>
                    ) : (
                        <Button onClick={restartExercise} variant="outline" size="lg" className="mt-4">
                            <RefreshCw className="mr-2" /> Recommencer
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto">
            <Progress value={((currentQuestionIndex + 1) / NUM_QUESTIONS) * 100} className="w-full mb-4" />
            <Card className="shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3 }} />
                </div>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">
                        Coche les mots qui <strong>commencent</strong> par le son <span className="text-primary font-mono text-3xl">[{currentQuestion.sound}]</span>
                    </CardTitle>
                    <CardDescription>Clique sur le haut-parleur pour écouter chaque mot.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[250px] flex flex-col items-center justify-center gap-4 p-6">
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {currentQuestion.options.map(option => {
                             const isSelected = selectedWords.includes(option.word);
                             const showCorrect = feedback && option.isCorrect;
                             const showIncorrect = feedback && isSelected && !option.isCorrect;
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
                                    showIncorrect && "bg-red-100 border-red-500 animate-shake"
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
                <CardFooter className="h-24 flex flex-col items-center justify-center gap-2">
                     <Button
                        onClick={checkAnswer}
                        disabled={!!feedback || selectedWords.length === 0}
                        size="lg"
                    >
                        Valider
                    </Button>
                    {feedback === 'correct' && <div className="mt-2 text-xl font-bold text-green-600 animate-pulse flex items-center gap-2"><ThumbsUp/> Parfait !</div>}
                    {feedback === 'incorrect' && <div className="mt-2 text-md font-bold text-red-600 animate-shake">Oups ! Ce n'est pas tout à fait ça.</div>}
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
