'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import Confetti from 'react-dom-confetti';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import type { MotSon } from '@/lib/exercise-content/sons';
import { getPooledContent } from '@/services/exercise-pool';
import {
    AnswerFeedback,
    DELAI_NOUVEL_ESSAI,
    DELAI_REUSSITE,
    ExerciseFinished,
    ExerciseProgress,
    HINT_CLASSES,
    QuestionCard,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const NUM_QUESTIONS = 10;

interface SoundChoiceExerciseProps {
    /** L'identifiant de l'exercice, pour le stock partagé et les scores. */
    slug: string;
    /** Le son travaillé, tel qu'on l'annonce à l'élève : « [an] ». */
    sound: string;
    /** Les graphies proposées. */
    options: readonly string[];
}

/**
 * Le squelette des exercices « Le son [an] » et « Le son [in] » : un mot à
 * trous, quatre graphies, une correction.
 *
 * Les deux exercices étaient deux copies du même fichier. Les réunir corrige
 * du même coup leur principal défaut : en cas d'erreur, les quatre boutons
 * viraient au rouge et l'élève repartait sans savoir ce qu'il fallait écrire.
 * Désormais sa réponse est marquée en rouge, la bonne en vert, et la correction
 * reste affichée le temps de la lire.
 */
export function SoundChoiceExercise({ slug, sound, options }: SoundChoiceExerciseProps) {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [questions, setQuestions] = useState<MotSon[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    const secondChance = useSecondChance();
    const [choix, setChoix] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    useEffect(() => {
        const loadQuestions = async () => {
            setQuestions(await getPooledContent<MotSon>(slug, NUM_QUESTIONS, {
                studentId: student?.id ?? null,
            }));
        };
        loadQuestions();
    }, [slug, student?.id]);

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    const handleNextQuestion = () => {
        setShowConfetti(false);
        setFeedback(null);
        setChoix(null);
        secondChance.reset();
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const checkAnswer = (selectedOption: string) => {
        if (feedback || !currentQuestion) return;
        setChoix(selectedOption);

        // Faux : on ne passe pas à la suite, l'élève reprend la main jusqu'à
        // écrire lui-même la bonne graphie.
        if (selectedOption !== currentQuestion.correct) {
            secondChance.registerError(selectedOption);
            setFeedback('retry');
            setTimeout(() => {
                setFeedback(null);
                setChoix(null);
            }, DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        setSessionDetails(prev => [...prev, {
            question: currentQuestion.word.replace(currentQuestion.correct, '__'),
            userAnswer: selectedOption,
            correctAnswer: currentQuestion.correct,
            status: issue,
        }]);

        // Seule une réussite du premier coup rapporte un point.
        if (issue === 'correct') {
            setCorrectAnswers(prev => prev + 1);
            setShowConfetti(true);
        }
        setFeedback(issue);
        setTimeout(handleNextQuestion, DELAI_REUSSITE);
    };

    useEffect(() => {
        const saveFinalScore = async () => {
            if (isFinished && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const score = (correctAnswers / NUM_QUESTIONS) * 100;
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({ userId: student.id, date: homeworkDate, skillSlug: slug, score });
                } else {
                    await addScore({ userId: student.id, skill: slug, score, details: sessionDetails });
                }
            }
        };
        saveFinalScore();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate, slug]);

    const restartExercise = async () => {
        setQuestions(await getPooledContent<MotSon>(slug, NUM_QUESTIONS, { studentId: student?.id ?? null }));
        setIsFinished(false);
        setCorrectAnswers(0);
        setCurrentQuestionIndex(0);
        setFeedback(null);
        setChoix(null);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };

    if (questions.length === 0 || !currentQuestion) {
        return <p className="p-8 text-center text-muted-foreground">Je prépare les mots…</p>;
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

    const wordParts = currentQuestion.word.split(currentQuestion.correct);
    const resultats = sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect');

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-1">
            <ExerciseProgress current={currentQuestionIndex} total={NUM_QUESTIONS} results={resultats} />

            <QuestionCard instruction={`Complète le mot avec le bon son ${sound}`}>
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3, width: '10px', height: '10px' }} />
                </div>

                {/* Le mot à trous, en très grand : c'est le centre de l'écran. */}
                <p className="text-center font-body text-5xl font-bold tracking-wider sm:text-6xl">
                    <span>{wordParts[0]}</span>
                    <span className="inline-block min-w-[5rem] border-b-4 border-dashed border-muted-foreground align-bottom">
                        {(feedback === 'correct' || feedback === 'corrected') && <span className="text-emerald-600">{currentQuestion.correct}</span>}
                    </span>
                    <span>{wordParts[1]}</span>
                </p>

                <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
                    {options.map(option => {
                        const estLaBonne = option === currentQuestion.correct;
                        const estMonChoix = option === choix;
                        const dejaEssaye = secondChance.wrongAnswers.includes(option);
                        return (
                            <Button
                                key={option}
                                variant="outline"
                                onClick={() => checkAnswer(option)}
                                disabled={!!feedback}
                                className={cn(
                                    'h-20 justify-center p-4 text-2xl transition-all duration-300 active:scale-95 disabled:opacity-100',
                                    // La bonne réponse se montre une fois trouvée…
                                    (feedback === 'correct' || feedback === 'corrected') && estLaBonne && 'border-emerald-600 bg-emerald-500 text-white',
                                    // …et l'élève voit clairement ce que, lui, venait d'essayer.
                                    feedback === 'retry' && estMonChoix && 'border-red-600 bg-red-500 text-white',
                                    dejaEssaye && !feedback && 'opacity-40 line-through',
                                    secondChance.showHint && !feedback && estLaBonne && HINT_CLASSES
                                )}
                            >
                                {option}
                            </Button>
                        );
                    })}
                </div>
            </QuestionCard>

            <AnswerFeedback status={feedback} hinted={secondChance.showHint} correctAnswer={currentQuestion.correct} />
        </div>
    );
}
