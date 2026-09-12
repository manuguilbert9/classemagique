
'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { RefreshCw, Keyboard, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-dom-confetti';
import { Progress } from './ui/progress';
import { ScoreTube } from './score-tube';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { VirtualKeyboard } from './virtual-keyboard';
import type { LettreAReconnaitre } from '@/lib/exercise-content/lettres-et-grilles';
import { getPooledContent } from '@/services/exercise-pool';
import {
    AnswerFeedback,
    DELAI_NOUVEL_ESSAI,
    ExerciseFinished,
    ExerciseProgress,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const LETTERS_PER_EXERCISE = 20;

export function LetterRecognitionExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    // La série de lettres vient du stock partagé : tous les élèves de la journée
    // rencontrent les mêmes, dans le même ordre.
    const [letters, setLetters] = useState<string[]>([]);
    const [lettersDone, setLettersDone] = useState(0);
    const currentLetter = letters[lettersDone] ?? '';
    
    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    // Le droit à l'erreur : l'élève cherche la touche jusqu'à la trouver.
    const secondChance = useSecondChance();
    const [showConfetti, setShowConfetti] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);

    const loadLetters = useCallback(async () => {
        const serie = await getPooledContent<LettreAReconnaitre>('letter-recognition', LETTERS_PER_EXERCISE, {
            studentId: student?.id ?? null,
        });
        setLetters(serie.map((l) => l.lettre));
    }, [student?.id]);

    useEffect(() => {
        loadLetters();
    }, [loadLetters]);

    const handleCorrect = () => {
        const issue = secondChance.resultOnSuccess();
        // Seule une touche trouvée du premier coup rapporte un point.
        if (issue === 'correct') {
            setCorrectAnswers(prev => prev + 1);
            setShowConfetti(true);
        }
        setFeedback(issue);

        setSessionDetails(prev => [...prev, {
            question: `Appuyer sur la touche "${currentLetter}"`,
            userAnswer: currentLetter,
            correctAnswer: currentLetter,
            status: issue,
        }]);

        setTimeout(handleNextLetter, 1000);
    };

    /**
     * Mauvaise touche : on ne passe pas à la lettre suivante. L'élève continue
     * de chercher sur le clavier — c'est exactement l'objet de l'exercice.
     */
    const handleIncorrect = (pressedKey: string) => {
        secondChance.registerError(pressedKey);
        setFeedback('retry');
        setTimeout(() => setFeedback(null), DELAI_NOUVEL_ESSAI);
    };
    
    const handleNextLetter = () => {
        secondChance.reset();
         if (lettersDone < LETTERS_PER_EXERCISE - 1) {
            setLettersDone(prev => prev + 1);
            setFeedback(null);
            setShowConfetti(false);
        } else {
            setIsFinished(true);
        }
    }

    const handleKeyPress = useCallback((key: string) => {
        if (feedback) return;

        if (key.toUpperCase() === currentLetter) {
            handleCorrect();
        } else {
            handleIncorrect(key.toUpperCase());
        }
    }, [currentLetter, feedback, handleCorrect, handleIncorrect]);

    useEffect(() => {
        const handlePhysicalKeystroke = (e: KeyboardEvent) => {
             // Ignore everything but single letters
            if (/^[a-zA-Z]$/.test(e.key)) {
                handleKeyPress(e.key);
            }
        };

        document.addEventListener('keydown', handlePhysicalKeystroke);
        return () => {
            document.removeEventListener('keydown', handlePhysicalKeystroke);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        const saveResult = async () => {
            if (isFinished && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const score = (correctAnswers / LETTERS_PER_EXERCISE) * 100;
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'letter-recognition',
                        score: score
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'letter-recognition',
                        score: score,
                        details: sessionDetails,
                    });
                }
            }
        };
        saveResult();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    const restartExercise = async () => {
        setLetters([]);
        setLettersDone(0);
        setFeedback(null);
        setShowConfetti(false);
        setIsFinished(false);
        setCorrectAnswers(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
        await loadLetters();
    };

    if (isFinished) {
        return (
            <ExerciseFinished
                correct={correctAnswers}
                total={LETTERS_PER_EXERCISE}
                canRestart={!isHomework}
                onRestart={restartExercise}
                returnHref={isHomework ? '/devoirs' : '/en-classe'}
                returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
            />
        );
    }
    
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <ExerciseProgress
                current={lettersDone}
                total={LETTERS_PER_EXERCISE}
                results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')}
            />
            <Card className={cn(
                "shadow-2xl text-center relative overflow-hidden transition-colors duration-300",
                (feedback === 'correct' || feedback === 'corrected') && 'bg-green-100 border-green-500',
                feedback === 'retry' && 'bg-red-100 border-red-500 animate-shake'
            )}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Confetti active={showConfetti} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3, width: "10px", height: "10px"}} />
                </div>
                 <CardHeader>
                    <CardTitle className="font-headline text-3xl">Appuie sur la bonne touche</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[250px] flex flex-col items-center justify-center gap-8 p-6">
                     <div className="relative font-mono text-9xl sm:text-[12rem] font-bold tracking-widest uppercase p-4 rounded-lg">
                        {currentLetter}
                        {(feedback === 'correct' || feedback === 'corrected') && <Check className="absolute -right-4 -top-4 h-16 w-16 text-green-600" />}
                        {feedback === 'retry' && <X className="absolute -right-4 -top-4 h-16 w-16 text-red-600" />}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="outline" onClick={() => setShowVirtualKeyboard(p => !p)}>
                        <Keyboard className="mr-2" />
                        {showVirtualKeyboard ? 'Cacher' : 'Afficher'} le clavier
                    </Button>
                </CardFooter>
            </Card>

            {showVirtualKeyboard && <VirtualKeyboard onKeyPress={handleKeyPress} />}
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
        </div>
    )
}
