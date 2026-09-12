'use client';

import { useState, useCallback, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, X, Loader2, ThumbsUp } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { ScoreTube } from './score-tube';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdjectiveEnrichmentSentence } from '@/data/grammaire/adjective-enrichment-sentences';
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

interface WordItem {
    id: string;
    word: string;
    type: 'base' | 'adjective';
}

function DroppableContainer({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}

function SortableWord({ item, disabled }: { item: WordItem; disabled?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: { type: item.type, word: item.word },
        disabled: disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                flex items-center justify-center px-4 py-2 rounded-lg shadow-sm border
                ${item.type === 'base' ? 'bg-muted text-muted-foreground border-muted-foreground/20 cursor-default' : 'bg-primary text-primary-foreground cursor-grab active:cursor-grabbing hover:bg-primary/90'}
                ${disabled ? 'cursor-default' : ''}
                text-lg font-medium select-none min-w-[60px]
            `}
        >
            {item.word}
        </div>
    );
}

export function AddAdjectivesExercise() {
    const { student } = useContext(UserContext);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [sentences, setSentences] = useState<AdjectiveEnrichmentSentence[]>([]);
    const [currentSentenceData, setCurrentSentenceData] = useState<AdjectiveEnrichmentSentence | null>(null);

    // Lists
    const [adjectives, setAdjectives] = useState<WordItem[]>([]);
    const [sentenceWords, setSentenceWords] = useState<WordItem[]>([]);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<WordItem | null>(null);

    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    // Le droit à l'erreur : l'élève replace ses adjectifs jusqu'à ce que la
    // phrase tienne debout.
    const secondChance = useSecondChance();
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Les phrases de la séance viennent du stock partagé.
    const loadSentences = useCallback(async () => {
        setSentences(await getPooledContent<AdjectiveEnrichmentSentence>('add-adjectives', NUM_QUESTIONS, {
            studentId: student?.id ?? null,
        }));
    }, [student?.id]);

    useEffect(() => {
        loadSentences();
    }, [loadSentences]);

    // Met en place la phrase courante dès que le lot ou la position change.
    useEffect(() => {
        const data = sentences[currentQuestionIndex];
        if (!data) return;
        setCurrentSentenceData(data);

        setSentenceWords(data.baseSentence.split(' ').map((word, i) => ({
            id: `base-${i}-${word}`,
            word,
            type: 'base' as const,
        })));

        setAdjectives(data.adjectives.map((word, i) => ({
            id: `adj-${i}-${word}`,
            word,
            type: 'adjective' as const,
        })));

        setFeedback(null);
    }, [sentences, currentQuestionIndex]);

    const findContainer = (id: string) => {
        if (adjectives.find((item) => item.id === id)) {
            return 'adjectives';
        }
        if (sentenceWords.find((item) => item.id === id)) {
            return 'sentence';
        }
        if (id === 'adjectives-container') {
            return 'adjectives';
        }
        if (id === 'sentence-container') {
            return 'sentence';
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);

        // Find the item
        const item =
            adjectives.find(i => i.id === active.id) ||
            sentenceWords.find(i => i.id === active.id);
        setActiveItem(item || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find containers
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Moving between containers
        if (activeContainer === 'adjectives' && overContainer === 'sentence') {
            const item = adjectives.find(i => i.id === activeId);
            if (!item) return; // Safety check

            setAdjectives(items => items.filter(i => i.id !== activeId));
            setSentenceWords(items => {
                const newItems = [...items];

                // If dropped on the container, append
                if (overId === 'sentence-container') {
                    newItems.push(item);
                } else {
                    const overIndex = items.findIndex(i => i.id === overId);
                    if (overIndex >= 0) {
                        newItems.splice(overIndex, 0, item);
                    } else {
                        newItems.push(item);
                    }
                }
                return newItems;
            });
        } else if (activeContainer === 'sentence' && overContainer === 'adjectives') {
            const item = sentenceWords.find(i => i.id === activeId);
            if (!item) return; // Safety check

            // Allow moving back to adjectives
            setSentenceWords(items => items.filter(i => i.id !== activeId));
            setAdjectives(items => {
                return [...items, item];
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer && activeContainer === overContainer) {
            const activeIndex = (activeContainer === 'adjectives' ? adjectives : sentenceWords).findIndex(i => i.id === activeId);
            const overIndex = (overContainer === 'adjectives' ? adjectives : sentenceWords).findIndex(i => i.id === overId);

            if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                if (activeContainer === 'adjectives') {
                    setAdjectives((items) => arrayMove(items, activeIndex, overIndex));
                } else {
                    setSentenceWords((items) => arrayMove(items, activeIndex, overIndex));
                }
            }
        }
    };

    const checkAnswer = () => {
        if (!currentSentenceData) return;

        const constructedSentence = sentenceWords.map(w => w.word).join(' ');
        const isCorrect = currentSentenceData.validSentences.includes(constructedSentence);

        // Faux : la phrase reste telle quelle et l'élève déplace ses adjectifs.
        if (!isCorrect) {
            secondChance.registerError();
            setFeedback('retry');
            setTimeout(() => setFeedback(null), DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        setSessionDetails(prev => [...prev, {
            question: `Enrichir : "${currentSentenceData.baseSentence}" avec "${currentSentenceData.adjectives.join(', ')}"`,
            userAnswer: constructedSentence,
            correctAnswer: currentSentenceData.validSentences[0],
            status: issue,
        }]);

        // Seule une phrase réussie du premier coup rapporte un point.
        if (issue === 'correct') {
            setCorrectAnswers(prev => prev + 1);
            setShowConfetti(true);
        }
        setFeedback(issue);

        setTimeout(() => {
            secondChance.reset();
            if (currentQuestionIndex < NUM_QUESTIONS - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setIsFinished(true);
            }
        }, 2000);
    };

    const restartExercise = async () => {
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setIsFinished(false);
        setHasBeenSaved(false);
        setSessionDetails([]);
        await loadSentences();
    };

    useEffect(() => {
        const saveResult = async () => {
            if (isFinished && student && !hasBeenSaved) {
                setHasBeenSaved(true);
                const score = (correctAnswers / NUM_QUESTIONS) * 100;
                await addScore({
                    userId: student.id,
                    skill: 'add-adjectives',
                    score: score,
                    details: sessionDetails,
                });
            }
        };
        saveResult();
    }, [isFinished, student, hasBeenSaved, correctAnswers, sessionDetails]);

    if (!currentSentenceData) return <Loader2 className="animate-spin" />;

    if (isFinished) {
        return (
            <ExerciseFinished
                correct={correctAnswers}
                total={NUM_QUESTIONS}
                canRestart
                onRestart={restartExercise}
                returnHref="/en-classe"
            />
        );
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center">Ajouter des adjectifs</CardTitle>
                <CardDescription className="text-center">Glisse les adjectifs dans la phrase pour l'enrichir.</CardDescription>
                <ExerciseProgress
                    current={currentQuestionIndex}
                    total={NUM_QUESTIONS}
                    results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')}
                    className="mt-4"
                />
            </CardHeader>
            <CardContent className="min-h-[400px] flex flex-col items-center gap-8 p-6">

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    {/* Adjectives Bank */}
                    <div className="w-full">
                        <h3 className="text-lg font-semibold mb-2 text-center text-muted-foreground">Adjectifs disponibles :</h3>
                        <DroppableContainer
                            className="p-4 bg-secondary/30 rounded-xl min-h-[80px] flex flex-wrap justify-center gap-3 border-2 border-dashed border-secondary"
                            id="adjectives-container"
                        >
                            <SortableContext items={adjectives.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                                {adjectives.map((item) => (
                                    <SortableWord key={item.id} item={item} />
                                ))}
                            </SortableContext>
                        </DroppableContainer>
                    </div>

                    {/* Sentence Construction Area */}
                    <div className="w-full">
                        <h3 className="text-lg font-semibold mb-2 text-center text-muted-foreground">Ta phrase :</h3>
                        <DroppableContainer
                            className="p-6 bg-background rounded-xl min-h-[100px] flex flex-wrap items-center justify-center gap-2 border-2 border-primary/20 shadow-inner"
                            id="sentence-container"
                        >
                            <SortableContext items={sentenceWords.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                                {sentenceWords.map((item) => (
                                    <SortableWord
                                        key={item.id}
                                        item={item}
                                        disabled={item.type === 'base'}
                                    />
                                ))}
                            </SortableContext>
                            {sentenceWords.length === 0 && (
                                <span className="text-muted-foreground italic">La phrase apparaîtra ici...</span>
                            )}
                        </DroppableContainer>
                    </div>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeItem ? (
                            <div className="flex items-center justify-center px-4 py-2 rounded-lg shadow-lg border bg-primary text-primary-foreground text-lg font-medium min-w-[60px] cursor-grabbing">
                                {activeItem.word}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6">
                <Button size="lg" onClick={checkAnswer} disabled={!!feedback || adjectives.length > 0}>
                    <Check className="mr-2" /> Valider
                </Button>
                <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full">
                    {feedback === 'retry' ? "Ce n'est pas tout à fait ça. Relis ta phrase : où placerais-tu l'adjectif ?" : undefined}
                </AnswerFeedback>
                {/* Après deux essais, une solution possible — il y en a souvent plusieurs. */}
                {secondChance.showHint && !feedback && (
                    <p className="rounded-[16px] border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-center font-bold text-amber-700">
                        Par exemple : « {currentSentenceData.validSentences[0]} »
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
