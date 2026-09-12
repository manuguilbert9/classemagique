

'use client';

import { useState, useMemo, useEffect, useContext, useCallback, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Loader2, Check, X } from 'lucide-react';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { Progress } from './ui/progress';
import { ScoreTube } from './score-tube';
import { cn } from '@/lib/utils';
import { VirtualKeyboard } from './virtual-keyboard';
import type { ProblemeSommeDix } from '@/lib/exercise-content/calcul-simple';
import { getPooledContent } from '@/services/exercise-pool';
import {
    DELAI_NOUVEL_ESSAI,
  AnswerFeedback,
    ExerciseFinished,
    ExerciseProgress,
    QuestionCard,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

type Problem = ProblemeSommeDix;
type Feedback = 'correct' | 'incorrect' | null;

const NUM_PROBLEMS = 5;

export function SommeDixExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');
    
    const [problems, setProblems] = useState<Problem[]>([]);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    const secondChance = useSecondChance();
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    
    useEffect(() => {
        generateNewProblems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student?.id]);

    const generateNewProblems = async () => {
        setIsLoading(true);
        setProblems(await getPooledContent<Problem>('somme-dix', NUM_PROBLEMS, {
            studentId: student?.id ?? null,
        }));
        setIsLoading(false);
    };

    const currentProblem = useMemo(() => {
        if (problems.length > 0) {
            return problems[currentProblemIndex];
        }
        return null;
    }, [problems, currentProblemIndex]);

    const handleNextProblem = useCallback(() => {
        secondChance.reset();
        if (currentProblemIndex < NUM_PROBLEMS - 1) {
            setCurrentProblemIndex(prev => prev + 1);
            setUserAnswer('');
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProblemIndex]);
    
    const checkAnswer = (answer: string) => {
        if (!currentProblem || feedback) return;

        // Faux : on efface la saisie et l'élève recompte. Il finira par taper
        // lui-même le bon total, ce qui est tout l'intérêt de l'exercice.
        if (parseInt(answer, 10) !== currentProblem.answer) {
            secondChance.registerError(answer);
            setFeedback('retry');
            setTimeout(() => {
                setFeedback(null);
                setUserAnswer('');
            }, DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        const detail: ScoreDetail = {
            question: `${currentProblem.operands[0]} + ${currentProblem.operands[1]}`,
            userAnswer: answer,
            correctAnswer: String(currentProblem.answer),
            status: issue,
        };
        setSessionDetails(prev => [...prev, detail]);

        // Seule une réussite du premier coup rapporte un point.
        if (issue === 'correct') setCorrectAnswers(prev => prev + 1);
        setFeedback(issue);

        setTimeout(handleNextProblem, 1500);
    }

    const handleKeystroke = (key: string) => {
        if(feedback) return;

        let newAnswer = userAnswer;
        if (key === 'Backspace' || key === '⌫') { // Backspace
            newAnswer = newAnswer.slice(0, -1);
        } else if (/^\d$/.test(key) && newAnswer.length < 2) {
            newAnswer += key;
        }
        setUserAnswer(newAnswer);

        // La reponse ne part plus des la bonne longueur atteinte : l'eleve
        // valide lui-meme, et peut donc corriger une frappe malheureuse.
    };
    
    const handlePhysicalKeystroke = (e: KeyboardEvent) => {
        if (e.key >= '0' && e.key <= '9') {
            handleKeystroke(e.key);
        } else if (e.key === 'Backspace') {
            handleKeystroke('⌫');
        } else if (e.key === 'Enter' && userAnswer.length > 0) {
            checkAnswer(userAnswer);
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handlePhysicalKeystroke);
        return () => {
            document.removeEventListener('keydown', handlePhysicalKeystroke);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAnswer, feedback]);


    useEffect(() => {
        const saveFinalScore = async () => {
             if (isFinished && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const score = (correctAnswers / NUM_PROBLEMS) * 100;
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'somme-dix',
                        score: score,
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'somme-dix',
                        score: score,
                        numberLevelSettings: { level: 'A' },
                        details: sessionDetails,
                    });
                }
            }
        }
        saveFinalScore();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate]);

    const restartExercise = () => {
        generateNewProblems();
        setCurrentProblemIndex(0);
        setUserAnswer('');
        setFeedback(null);
        setIsFinished(false);
        setCorrectAnswers(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };
    
    if (isLoading) {
        return <p className="p-8 text-center text-muted-foreground">Je prépare les calculs…</p>;
    }

    if (isFinished) {
        return (
            <ExerciseFinished
                correct={correctAnswers}
                total={NUM_PROBLEMS}
                canRestart={!isHomework}
                onRestart={restartExercise}
                returnHref={isHomework ? '/devoirs' : '/en-classe'}
                returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
            />
        );
    }

    if (!currentProblem) {
        return <p className="p-8 text-center text-muted-foreground">Je prépare les calculs…</p>;
    }

    const resultats = sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect');

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5 p-1">
            <ExerciseProgress current={currentProblemIndex} total={NUM_PROBLEMS} results={resultats} />

            <QuestionCard instruction="Combien y a-t-il d'objets en tout ?">
                {/* Les deux collections, chacune avec son cardinal écrit dessous :
                    l'élève peut compter les objets ou lire le nombre. */}
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                    {[0, 1].map((rang) => (
                        <Fragment key={rang}>
                            {rang === 1 && <span className="text-5xl font-bold text-primary">+</span>}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex max-w-[150px] flex-wrap justify-center gap-1 text-4xl">
                                    {Array.from({ length: currentProblem.operands[rang] }).map((_, i) => (
                                        <span key={i}>{currentProblem.emoji}</span>
                                    ))}
                                </div>
                                <p className="text-3xl font-bold">{currentProblem.operands[rang]}</p>
                            </div>
                        </Fragment>
                    ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <div
                        className={cn(
                            'relative flex h-24 w-48 items-center justify-center rounded-[18px] border-2 transition-colors',
                            (feedback === 'correct' || feedback === 'corrected') && 'border-emerald-500 bg-emerald-50',
                            feedback === 'retry' && 'border-red-500 bg-red-50',
                            !feedback && 'border-dashed'
                        )}
                    >
                        <span className="text-6xl font-bold">{userAnswer}</span>
                        {!feedback && !userAnswer && (
                            <span className="absolute bottom-2 text-xs text-muted-foreground">Tape ta réponse</span>
                        )}
                        {/* Après deux essais, on donne le total : l'élève le tape quand même. */}
                        {secondChance.showHint && !feedback && (
                            <span className="absolute bottom-2 text-xs font-bold text-amber-600">
                                Réponse : {currentProblem.answer}
                            </span>
                        )}
                    </div>

                    {/* La validation est explicite : on peut se relire avant d'envoyer. */}
                    <Button
                        size="lg"
                        className="w-48 text-xl"
                        disabled={!userAnswer || !!feedback}
                        onClick={() => checkAnswer(userAnswer)}
                    >
                        Valider
                    </Button>
                </div>
            </QuestionCard>

            <AnswerFeedback status={feedback} hinted={secondChance.showHint} correctAnswer={currentProblem.answer} />

            <VirtualKeyboard onKeyPress={handleKeystroke} numericOnly />
        </div>
    )
}
