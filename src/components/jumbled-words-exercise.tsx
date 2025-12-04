'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, X, Loader2, ThumbsUp, Shuffle, ArrowLeft } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { ScoreTube } from './score-tube';
import { getSpellingLists, type SpellingList } from '@/services/spelling';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
    DropAnimation,
    TouchSensor,
    MouseSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const NUM_QUESTIONS = 5;

interface LetterItem {
    id: string;
    letter: string;
}

function SortableLetter({ item, disabled }: { item: LetterItem; disabled?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
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
                flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-md border-2
                ${disabled
                    ? 'bg-muted text-muted-foreground border-muted cursor-default'
                    : 'bg-background text-foreground border-primary/20 hover:border-primary cursor-grab active:cursor-grabbing hover:bg-accent'
                }
                text-2xl sm:text-3xl font-bold select-none
            `}
        >
            {item.letter}
        </div>
    );
}

export function JumbledWordsExercise() {
    const { student } = useContext(UserContext);

    const [availableLists, setAvailableLists] = useState<SpellingList[]>([]);
    const [selectedList, setSelectedList] = useState<SpellingList | null>(null);
    const [isLoadingLists, setIsLoadingLists] = useState(true);

    const [words, setWords] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState<string>('');
    const [currentLetters, setCurrentLetters] = useState<LetterItem[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
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
        }),
        useSensor(TouchSensor),
        useSensor(MouseSensor)
    );

    useEffect(() => {
        async function loadLists() {
            setIsLoadingLists(true);
            try {
                const lists = await getSpellingLists();
                setAvailableLists(lists);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingLists(false);
            }
        }
        loadLists();
    }, []);

    const startExercise = (listData: SpellingList, session: 'lundi' | 'jeudi' | 'all') => {
        setSelectedList(listData);
        let sessionWords: string[] = [];

        if (session === 'all') {
            sessionWords = listData.words;
        } else {
            const half = Math.ceil(listData.words.length / 2);
            sessionWords = session === 'lundi' ? listData.words.slice(0, half) : listData.words.slice(half);
        }

        // Shuffle and pick words
        const shuffled = sessionWords.sort(() => 0.5 - Math.random()).slice(0, NUM_QUESTIONS);
        setWords(shuffled);
        setQuestionIndex(0);
        setCorrectAnswers(0);
        setIsFinished(false);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };

    const loadQuestion = useCallback((index: number) => {
        if (!words[index]) return;
        const word = words[index];
        setCurrentWord(word);

        // Create letter items and shuffle them
        const letters = word.split('').map((char, i) => ({
            id: `${i}-${char}-${Math.random()}`,
            letter: char
        }));

        // Shuffle until it's not the original word (if possible)
        let shuffledLetters = [...letters];
        if (word.length > 1) {
            let attempts = 0;
            do {
                shuffledLetters = shuffledLetters.sort(() => 0.5 - Math.random());
                attempts++;
            } while (shuffledLetters.map(l => l.letter).join('') === word && attempts < 10);
        }

        setCurrentLetters(shuffledLetters);
        setFeedback(null);
        setShowConfetti(false);
    }, [words]);

    useEffect(() => {
        if (words.length > 0) {
            loadQuestion(0);
        }
    }, [words, loadQuestion]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id && over) {
            setCurrentLetters((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                // Robustness check
                if (oldIndex !== -1 && newIndex !== -1) {
                    return arrayMove(items, oldIndex, newIndex);
                }
                return items;
            });
        }
    };

    const checkAnswer = () => {
        const proposedWord = currentLetters.map(l => l.letter).join('');
        const isCorrect = proposedWord === currentWord;

        const detail: ScoreDetail = {
            question: `Remettre en ordre : ${currentWord}`,
            userAnswer: proposedWord,
            correctAnswer: currentWord,
            status: isCorrect ? 'correct' : 'incorrect',
        };
        setSessionDetails(prev => [...prev, detail]);

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
            setFeedback('correct');
            setShowConfetti(true);
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            if (questionIndex < NUM_QUESTIONS - 1) {
                setQuestionIndex(prev => prev + 1);
                loadQuestion(questionIndex + 1);
            } else {
                setIsFinished(true);
            }
        }, 2000);
    };

    const restartExercise = () => {
        setSelectedList(null);
        setWords([]);
    };

    // Save score
    useEffect(() => {
        const saveResult = async () => {
            if (isFinished && student && !hasBeenSaved && selectedList) {
                setHasBeenSaved(true);
                const score = (correctAnswers / NUM_QUESTIONS) * 100;
                await addScore({
                    userId: student.id,
                    skill: 'jumbled-words',
                    score: score,
                    details: sessionDetails,
                });
            }
        };
        saveResult();
    }, [isFinished, student, hasBeenSaved, correctAnswers, sessionDetails, selectedList]);


    if (isLoadingLists) return <Loader2 className="animate-spin mx-auto mt-12" />;

    if (!selectedList) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6">Choisis ta liste de mots</h2>
                {availableLists.length === 0 ? (
                    <Card><CardHeader><CardTitle className="text-center">Aucune liste trouvée</CardTitle></CardHeader></Card>
                ) : (
                    availableLists.map(l => (
                        <Card key={l.id} className="p-4">
                            <CardHeader className="p-2">
                                <CardDescription className="font-bold text-lg">{l.id} - {l.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 flex flex-col sm:flex-row gap-4">
                                <Button onClick={() => startExercise(l, 'lundi')} className="w-full">Session 1 (Lundi)</Button>
                                <Button onClick={() => startExercise(l, 'jeudi')} className="w-full">Session 2 (Jeudi)</Button>
                                <Button onClick={() => startExercise(l, 'all')} className="w-full" variant="secondary">Toute la liste</Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        );
    }

    if (words.length === 0) return <Loader2 className="animate-spin" />;

    if (isFinished) {
        const score = (correctAnswers / NUM_QUESTIONS) * 100;
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-8">
                <CardHeader><CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as réussi <span className="font-bold text-primary">{correctAnswers}</span> mots sur <span className="font-bold">{NUM_QUESTIONS}</span>.
                    </p>
                    <ScoreTube score={score} />
                    <Button onClick={restartExercise} variant="outline" size="lg" className="mt-4"><RefreshCw className="mr-2" />Choisir une autre liste</Button>
                </CardContent>
            </Card>
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
        <Card className="w-full max-w-3xl mx-auto shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 100 }} />
            </div>
            <CardHeader className="relative">
                <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={() => setSelectedList(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <CardTitle className="font-headline text-2xl text-center pt-6">Lettres dans le désordre</CardTitle>
                <CardDescription className="text-center">Remets les lettres dans le bon ordre pour former le mot.</CardDescription>
                <Progress value={((questionIndex) / NUM_QUESTIONS) * 100} className="w-full mt-4 h-3" />
            </CardHeader>
            <CardContent className="min-h-[300px] flex flex-col items-center justify-center gap-8 p-6">

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={currentLetters.map(l => l.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex flex-wrap justify-center gap-3 p-4">
                            {currentLetters.map((item) => (
                                <SortableLetter key={item.id} item={item} disabled={!!feedback} />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId ? (
                            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-xl border-2 bg-primary text-primary-foreground text-2xl sm:text-3xl font-bold cursor-grabbing">
                                {currentLetters.find(l => l.id === activeId)?.letter}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6">
                <Button size="lg" onClick={checkAnswer} disabled={!!feedback} className="w-full max-w-xs">
                    <Check className="mr-2" /> Valider
                </Button>

                {feedback === 'correct' && (
                    <div className="text-xl font-bold text-green-600 flex items-center gap-2 animate-pulse">
                        <ThumbsUp /> Bravo ! C'est bien "{currentWord}".
                    </div>
                )}

                {feedback === 'incorrect' && (
                    <div className="text-xl font-bold text-red-600 flex flex-col items-center gap-2 animate-shake text-center">
                        <div className="flex items-center gap-2"><X /> Ce n'est pas ça.</div>
                        <div className="text-base font-normal text-foreground">La réponse était : <span className="font-bold">{currentWord}</span></div>
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
