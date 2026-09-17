
'use client';

import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { RefreshCw, Keyboard, Volume2 } from 'lucide-react';
import { getSimpleWords, WordWithEmoji } from '@/lib/word-list';
import { cn } from '@/lib/utils';
import Confetti from 'react-dom-confetti';
import { Progress } from './ui/progress';
import { ScoreTube } from './score-tube';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { VirtualKeyboard } from './virtual-keyboard';

const WORDS_PER_EXERCISE = 10;

export function KeyboardCopyExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [words, setWords] = useState<WordWithEmoji[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [typedWord, setTypedWord] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
    const [wordErrors, setWordErrors] = useState(0);

    useEffect(() => {
        setWords(getSimpleWords(WORDS_PER_EXERCISE));
    }, []);

    const wordsCount = words.length > 0 ? words.length : WORDS_PER_EXERCISE;
    const currentWordObject = useMemo(() => words[currentWordIndex] || null, [words, currentWordIndex]);
    const currentWord = useMemo(() => currentWordObject?.word || '', [currentWordObject]);
    
    const handleSpeak = useCallback((word: string) => {
        if (!word || !('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, []);

    useEffect(() => {
        if (currentWord) {
            handleSpeak(currentWord);
        }
    }, [currentWord, handleSpeak]);

    const processInput = (input: string) => {
        if (showConfetti || isFinished) return;
        input = input.normalize('NFC');
        const targetPart = currentWord.substring(0, input.length);
        if (input.toLowerCase() === targetPart.toLowerCase()) {
            setTypedWord(input);
        } else {
            setWordErrors(count => count + 1);
        }
    }

    const handlePhysicalKeystroke = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length === 1 && /^\p{L}$/u.test(e.key)) {
             e.preventDefault();
             processInput(typedWord + e.key);
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            processInput(typedWord.slice(0, -1));
        }
    }

     const handleVirtualKeystroke = (key: string) => {
        if (key === '⌫') { // Backspace
            processInput(typedWord.slice(0, -1));
        } else {
            processInput(typedWord + key);
        }
    };


    useEffect(() => {
        document.addEventListener('keydown', handlePhysicalKeystroke);
        return () => {
            document.removeEventListener('keydown', handlePhysicalKeystroke);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typedWord, currentWord, showConfetti, isFinished]);


    useEffect(() => {
        if (typedWord.toLowerCase() === currentWord.toLowerCase() && currentWord !== '') {
            setCorrectAnswers(prev => prev + (wordErrors === 0 ? 1 : 0));
            setShowConfetti(true);
            const detail: ScoreDetail = {
                question: `Recopier "${currentWord}"`,
                userAnswer: typedWord,
                correctAnswer: currentWord,
                status: wordErrors === 0 ? 'correct' : 'corrected',
            };
            setSessionDetails(prev => [...prev, detail]);

            setTimeout(() => {
                setShowConfetti(false);
                if (currentWordIndex < wordsCount - 1) {
                    setCurrentWordIndex(prev => prev + 1);
                    setTypedWord('');
                    setWordErrors(0);
                } else {
                    setIsFinished(true);
                }
            }, 1000);
        }
    }, [typedWord, currentWord, currentWordIndex, wordsCount]);
    
      useEffect(() => {
        const saveResult = async () => {
            if (isFinished && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const score = (correctAnswers / wordsCount) * 100;
                
                if (isHomework && homeworkDate) {
                     await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'keyboard-copy',
                        details: sessionDetails,
                        score: score
                     });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'keyboard-copy',
                        score: score,
                        details: sessionDetails,
                    });
                }
            }
        };
        saveResult();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, wordsCount, isHomework, homeworkDate]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processInput(e.target.value);
    };

    const restartExercise = () => {
        setWords(getSimpleWords(WORDS_PER_EXERCISE));
        setCurrentWordIndex(0);
        setTypedWord('');
        setIsFinished(false);
        setCorrectAnswers(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
        setWordErrors(0);
    };
    
    if (isFinished) {
        const score = (correctAnswers / wordsCount) * 100;
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
                <CardHeader>
                    <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as recopié {wordsCount} mots, dont <span className="font-bold text-primary">{correctAnswers}</span> sans erreur.
                    </p>
                    <ScoreTube score={score} />
                    {isHomework ? (
                        <p className="text-muted-foreground">Tes devoirs sont terminés !</p>
                    ) : (
                        <Button onClick={restartExercise} variant="outline" size="lg" className="mt-4">
                            <RefreshCw className="mr-2" />
                            Recommencer
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <Progress value={((currentWordIndex) / wordsCount) * 100} className="w-full h-3" />
            <Card className="shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Confetti active={showConfetti} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3, width: "10px", height: "10px"}} />
                </div>
                 <CardHeader>
                    <CardTitle className="font-headline text-3xl">Recopie le mot suivant</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[250px] flex flex-col items-center justify-center gap-8 p-6">
                    <div className="flex flex-wrap justify-center items-center gap-3 w-full min-w-0">
                         {currentWordObject?.emoji !== '📝' && <span className="text-5xl" aria-hidden="true">{currentWordObject?.emoji}</span>}
                         <div className="w-full order-first break-all font-mono text-4xl sm:text-6xl font-bold tracking-wide uppercase p-3 bg-muted rounded-lg">
                            {currentWord}
                        </div>
                        <Button aria-label="Écouter le mot" variant="ghost" size="icon" onClick={() => handleSpeak(currentWord)} className="h-14 w-14">
                            <Volume2 className="h-10 w-10 text-muted-foreground" />
                        </Button>
                    </div>

                    <div aria-hidden="true" className="relative flex flex-wrap justify-center font-mono text-3xl sm:text-5xl font-bold uppercase">
                        {currentWord.split('').map((char, index) => {
                            const isTyped = index < typedWord.length;
                            const isCurrent = index === typedWord.length;
                            const isFuture = index > typedWord.length;

                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        "inline-block mx-1 transition-all duration-200",
                                        isTyped && "text-gray-400",
                                        isCurrent && "text-black scale-125",
                                        isFuture && "text-gray-400"
                                    )}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </div>
                     <input
                        type="text"
                        value={typedWord}
                        onChange={handleInputChange}
                        aria-label="Recopier le mot"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        disabled={showConfetti}
                        className="w-full min-h-12 rounded-lg border-2 border-primary/30 p-2 text-center text-2xl uppercase"
                    />
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => setShowVirtualKeyboard(p => !p)}>
                        <Keyboard className="mr-2" />
                        {showVirtualKeyboard ? 'Cacher' : 'Afficher'} le clavier
                    </Button>
                </CardFooter>
            </Card>

            {showVirtualKeyboard && <VirtualKeyboard disabled={showConfetti} onKeyPress={handleVirtualKeystroke} />}
        </div>
    )
}
