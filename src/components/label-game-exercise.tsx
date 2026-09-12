
'use client';

import { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, X, Loader2, ThumbsUp } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SkillLevel } from '@/lib/skills';
import type { PhraseEtiquettes } from '@/lib/exercise-content/phrases';
import { getPooledContent } from '@/services/exercise-pool';
import {
    AnswerFeedback,
    DELAI_NOUVEL_ESSAI,
    ExerciseFinished,
    ExerciseProgress,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';

const NUM_QUESTIONS = 5;

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array]; // Create a copy to avoid mutating the original

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [newArray[currentIndex], newArray[randomIndex]] = [
            newArray[randomIndex], newArray[currentIndex]];
    }

    return newArray;
};


interface LabelItem {
    id: string;
    word: string;
}

// The component for each draggable word label
function SortableLabel({ item }: { item: LabelItem }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className="flex items-center gap-2 p-3 bg-card border rounded-lg shadow-sm cursor-grab active:cursor-grabbing active:shadow-md"
        >
            <span className="text-xl font-medium select-none">{item.word}</span>
        </div>
    );
}

export function LabelGameExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [level, setLevel] = useState<SkillLevel>('B');
    // Les phrases de la séance viennent du stock partagé, calibrées sur le niveau.
    const [allPhrases, setAllPhrases] = useState<string[]>([]);

    const [currentSentence, setCurrentSentence] = useState('');
    const [orderedLabels, setOrderedLabels] = useState<LabelItem[]>([]);

    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    // Le droit à l'erreur : l'élève continue de déplacer ses étiquettes
    // jusqu'à reconstituer la phrase.
    const secondChance = useSecondChance();
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const sensors = useSensors(useSensor(PointerSensor));

    const resetExerciseState = useCallback(() => {
        setCurrentSentence('');
        setOrderedLabels([]);
        setCurrentQuestionIndex(0);
        setFeedback(null);
        setIsFinished(false);
        setCorrectAnswers(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
        setShowConfetti(false);
    }, []);

    useEffect(() => {
        if (student?.levels?.['label-game']) {
            setLevel(student.levels['label-game']);
        }
    }, [student]);

    const loadPhrases = useCallback(async () => {
        const lot = await getPooledContent<PhraseEtiquettes>('label-game', NUM_QUESTIONS, {
            settings: { level },
            studentId: student?.id ?? null,
        });
        setAllPhrases(lot.map((p) => p.phrase));
    }, [level, student?.id]);

    useEffect(() => {
        loadPhrases();
    }, [loadPhrases]);

    // Met en place la phrase courante : les étiquettes sont mélangées à
    // l'affichage, la phrase à reconstituer reste la même pour tous.
    useEffect(() => {
        const sentence = allPhrases[currentQuestionIndex];
        if (!sentence) return;
        const words = sentence.split(/\s+/).filter(Boolean);
        setCurrentSentence(sentence);
        setOrderedLabels(shuffleArray(words.map((word, i) => ({ id: `${currentQuestionIndex}-${i}-${word}`, word }))));
    }, [allPhrases, currentQuestionIndex]);

    const handleNextQuestion = () => {
        setShowConfetti(false);
        if (currentQuestionIndex < NUM_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };

    const checkAnswer = () => {
        if (feedback) return;

        const reconstructedSentence = orderedLabels.map(label => label.word).join(' ');
        const isCorrect = reconstructedSentence === currentSentence;

        // Faux : les étiquettes restent où elles sont, l'élève les réordonne.
        if (!isCorrect) {
            secondChance.registerError();
            setFeedback('retry');
            setTimeout(() => setFeedback(null), DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        setSessionDetails(prev => [...prev, {
            question: `Remettre en ordre : "${currentSentence}"`,
            userAnswer: reconstructedSentence,
            correctAnswer: currentSentence,
            status: issue,
        }]);

        // Seule une phrase reconstruite du premier coup rapporte un point.
        if (issue === 'correct') {
            setCorrectAnswers(prev => prev + 1);
            setShowConfetti(true);
        }
        setFeedback(issue);

        setTimeout(handleNextQuestion, 2000);
    };

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setOrderedLabels((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    useEffect(() => {
        const saveResult = async () => {
            if (isFinished && student && !hasBeenSaved && level) {
                setHasBeenSaved(true);
                const score = (correctAnswers / NUM_QUESTIONS) * 100;
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'label-game',
                        score: score
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'label-game',
                        score: score,
                        details: sessionDetails,
                        numberLevelSettings: { level }
                    });
                }
            }
        };
        saveResult();
    }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate, level]);

    const restartExercise = async () => {
        resetExerciseState();
        await loadPhrases();
    };

    if (allPhrases.length === 0) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-2xl p-6">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-center">Préparation de l'exercice...</CardTitle>
                </CardHeader>
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
        <Card className="w-full max-w-2xl mx-auto shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center">Le jeu des étiquettes</CardTitle>
                <CardDescription className="text-center">Fais glisser les mots pour remettre la phrase dans le bon ordre.</CardDescription>
                <ExerciseProgress
                    current={currentQuestionIndex}
                    total={NUM_QUESTIONS}
                    results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')}
                    className="mt-4"
                />
            </CardHeader>
            <CardContent className="min-h-[300px] flex flex-col items-center justify-center gap-6 p-6">

                <div className="p-4 bg-muted rounded-lg w-full min-h-[8rem] flex items-center justify-center">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={orderedLabels.map(l => l.id)} strategy={horizontalListSortingStrategy}>
                            <div className="flex flex-wrap justify-center gap-3">
                                {orderedLabels.map((labelItem) => (
                                    <SortableLabel key={labelItem.id} item={labelItem} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6">
                <Button size="lg" onClick={checkAnswer} disabled={!!feedback}>
                    <Check className="mr-2" /> Valider
                </Button>
                <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full">
                    {feedback === 'retry' ? "Ce n'est pas encore le bon ordre. Relis ta phrase à voix basse." : undefined}
                </AnswerFeedback>
                {/* Après deux essais, on donne la phrase : l'élève la remet quand même en ordre. */}
                {secondChance.showHint && !feedback && (
                    <p className="rounded-[16px] border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-center font-bold text-amber-700">
                        {currentSentence}
                    </p>
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
