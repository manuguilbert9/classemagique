
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import { Check, RefreshCw, X, ThumbsUp } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { MBP_WORDS } from '@/data/orthographe/mbp-words';

const NUM_QUESTIONS = 10;

interface MbpQuestion {
    word: string;
    missingPart: string;
    correctLetter: 'n' | 'm';
}

const findMbpPattern = (word: string): { base: string, missing: string, correct: 'n' | 'm' } | null => {
    const lowerWord = word.toLowerCase();
    
    // Find 'm' before m, b, p
    let match = lowerWord.match(/(.*)m([mbp].*)/);
    if (match) {
        return { base: match[1], missing: match[2], correct: 'm' };
    }
    
    // Find 'n' not before m, b, p
    match = lowerWord.match(/(.*)n([^mbp\s].*)/);
    if (match) {
        return { base: match[1], missing: match[2], correct: 'n' };
    }

    // Find 'om' 'am' 'em' 'im' not followed by m,b,p (should be n) - less common but good for traps
    match = lowerWord.match(/(.*)(a|e|o|i)m([^mbp\s].*)/);
     if (match) {
         // This is a trap, the rule would say 'n'. This logic is complex.
         // Let's stick to simpler cases for now.
    }

    return null;
}

const generateQuestion = (): MbpQuestion => {
    let question: MbpQuestion | null = null;
    let attempts = 0;
    while (!question && attempts < 50) {
        const randomWord = MBP_WORDS[Math.floor(Math.random() * MBP_WORDS.length)];
        const pattern = findMbpPattern(randomWord);
        if (pattern) {
            question = {
                word: randomWord,
                missingPart: pattern.base + '___' + pattern.missing,
                correctLetter: pattern.correct
            };
        }
        attempts++;
    }
    
    // Fallback if no suitable word found
    if (!question) {
        return { word: "CHAMBRE", missingPart: "cha___bre", correctLetter: 'm' };
    }
    
    return question;
};

export function MbpRuleExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [questions, setQuestions] = useState<MbpQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    
    useEffect(() => {
        const newQuestions = Array.from({ length: NUM_QUESTIONS }, generateQuestion);
        setQuestions(newQuestions);
    }, []);

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    const handleNextQuestion = () => {
        setShowConfetti(false);
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };
    
    const checkAnswer = (selectedLetter: 'n' | 'm') => {
        if (feedback) return;

        const isCorrect = selectedLetter === currentQuestion.correctLetter;
        const detail: ScoreDetail = {
            question: `Compléter: ${currentQuestion.missingPart}`,
            userAnswer: selectedLetter,
            correctAnswer: currentQuestion.correctLetter,
            status: isCorrect ? 'correct' : 'incorrect',
        };
        setSessionDetails(prev => [...prev, detail]);

        if (isCorrect) {
            setFeedback('correct');
            setCorrectAnswers(prev => prev + 1);
            setShowConfetti(true);
        } else {
            setFeedback('incorrect');
        }
        setTimeout(handleNextQuestion, 1500);
    };

     useEffect(() => {
      const saveFinalScore = async () => {
           if (isFinished && student && !hasBeenSaved) {
              setHasBeenSaved(true);
              const score = (correctAnswers / NUM_QUESTIONS) * 100;
              if (isHomework && homeworkDate) {
                await saveHomeworkResult({
                    userId: student.id,
                    date: homeworkDate,
                    skillSlug: 'regle-mbp',
                    score: score
                });
              } else {
                await addScore({
                    userId: student.id,
                    skill: 'regle-mbp',
                    score: score,
                    details: sessionDetails,
                });
              }
          }
      }
      saveFinalScore();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    const restartExercise = () => {
        setQuestions(Array.from({ length: NUM_QUESTIONS }, generateQuestion));
        setIsFinished(false);
        setCorrectAnswers(0);
        setCurrentQuestionIndex(0);
        setFeedback(null);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };
    
    if (questions.length === 0) {
        return <div>Chargement...</div>
    }

    if (isFinished) {
        const score = (correctAnswers / NUM_QUESTIONS) * 100;
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
                <CardHeader>
                    <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as obtenu <span className="font-bold text-primary">{correctAnswers}</span> bonnes réponses sur <span className="font-bold">{NUM_QUESTIONS}</span>.
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
    
    const wordParts = currentQuestion.missingPart.split('___');

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Progress value={((currentQuestionIndex + 1) / NUM_QUESTIONS) * 100} className="w-full mb-4" />
            <Card className="shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
                </div>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Complète avec n ou m :</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[250px] flex flex-col items-center justify-center gap-8 p-6">
                    <div className="font-body text-6xl font-bold tracking-wider">
                        <span>{wordParts[0]}</span>
                        <span className="inline-block w-24 border-b-4 border-dashed border-muted-foreground align-bottom text-center">
                            {feedback && (
                                <span className={cn('animate-in fade-in', feedback === 'correct' ? 'text-green-600' : 'text-red-500')}>
                                    {currentQuestion.correctLetter}
                                </span>
                            )}
                        </span>
                        <span>{wordParts[1]}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
                        {(['m', 'n'] as const).map(option => (
                             <Button
                                key={option}
                                variant="outline"
                                onClick={() => checkAnswer(option)}
                                className={cn(
                                "text-4xl h-24 p-4 justify-center transition-all duration-300 transform active:scale-95 font-mono",
                                feedback === 'correct' && option === currentQuestion.correctLetter && 'bg-green-500/80 text-white border-green-600 scale-105',
                                feedback === 'incorrect' && 'bg-red-500/80 text-white border-red-600 animate-shake'
                                )}
                                disabled={!!feedback}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="h-16 flex items-center justify-center">
                    {feedback === 'correct' && <div className="text-2xl font-bold text-green-600 animate-pulse flex items-center gap-2"><ThumbsUp/> C'est juste !</div>}
                    {feedback === 'incorrect' && <div className="text-xl font-bold text-red-600 animate-shake">Oups ! La bonne réponse était "{currentQuestion.correctLetter}".</div>}
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
