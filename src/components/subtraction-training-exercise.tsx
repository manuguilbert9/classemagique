'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, ArrowDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateSubtractionTrainingSet, SubtractionQuestion } from '@/lib/subtraction-training-questions';
import { addScore } from '@/services/scores';
import { UserContext } from '@/context/user-context';

// Fonction pour déterminer la couleur d'une colonne
function getColumnColorClasses(columnIndex: number) {
    const colors = [
        {
            border: 'border-blue-400',
            text: 'text-blue-700',
            bg: 'bg-blue-50',
            ring: 'focus-within:ring-blue-300'
        }, // Unités (index 2)
        {
            border: 'border-red-400',
            text: 'text-red-700',
            bg: 'bg-red-50',
            ring: 'focus-within:ring-red-300'
        }, // Dizaines (index 1)
        {
            border: 'border-green-400',
            text: 'text-green-700',
            bg: 'bg-green-50',
            ring: 'focus-within:ring-green-300'
        }, // Centaines (index 0)
    ];
    return colors[2 - columnIndex]; // Inverse pour avoir U, D, C
}

const getPositionName = (i: number) => {
    if (i === 0) return 'centaines';
    if (i === 1) return 'dizaines';
    return 'unités';
};

interface Step {
    type: 'bar' | 'retenue' | 'retenue_chain' | 'add_ten' | 'add_ten_retenue' | 'result';
    position: number;
    expectedValue?: string | null;
    expectedBar?: boolean;
    hint: string;
    highlight: { position: number; type: 'minuend' | 'retenue' | 'smallone' | 'result' };
    hasBeenBorrowed?: boolean;
    workingDigit?: number;
    checkResult?: (userSmallOnes: string[], userRetenues: string[], userResult: string[]) => boolean;
}

export function SubtractionTrainingExercise() {
    const { student } = useContext(UserContext);

    // Progression state
    const [questions, setQuestions] = useState<SubtractionQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
    const [hasCollectedReward, setHasCollectedReward] = useState(false);

    // Current problem state
    const [minuend, setMinuend] = useState(['', '', '']);
    const [subtrahend, setSubtrahend] = useState(['', '', '']);
    const [started, setStarted] = useState(false);
    const [userRetenues, setUserRetenues] = useState(['', '', '']);
    const [userSmallOnes, setUserSmallOnes] = useState(['', '', '']);
    const [barredCells, setBarredCells] = useState([false, false, false]);
    const [userResult, setUserResult] = useState(['', '', '']);
    const [currentHint, setCurrentHint] = useState('');
    const [highlightPosition, setHighlightPosition] = useState<number | null>(null);
    const [highlightType, setHighlightType] = useState('');
    const [completed, setCompleted] = useState(false);
    const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [expectedSteps, setExpectedSteps] = useState<Step[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Initialize questions on mount
    useEffect(() => {
        const questionSet = generateSubtractionTrainingSet();
        setQuestions(questionSet);
        loadQuestion(questionSet[0]);
    }, []);

    const calculateExpectedSteps = (): Step[] => {
        const num1 = minuend.map(d => d === '' ? 0 : parseInt(d));
        const num2 = subtrahend.map(d => d === '' ? 0 : parseInt(d));
        const workingNum = [...num1];
        const originalNum = [...num1];
        const hasBeenBorrowed = [false, false, false];
        const steps: Step[] = [];

        for (let i = 2; i >= 0; i--) {
            let digit1 = workingNum[i];
            const digit2 = num2[i];

            if (digit1 < digit2) {
                let j = i - 1;
                while (j >= 0 && workingNum[j] === 0) {
                    steps.push({
                        type: 'bar',
                        position: j,
                        expectedBar: true,
                        hint: `Le ${workingNum[i]} des ${getPositionName(i)} ne peut pas emprunter au 0 des ${getPositionName(j)}. Barre le 0 (clique et maintiens).`,
                        highlight: { position: j, type: 'minuend' }
                    });

                    workingNum[j] = 9;
                    hasBeenBorrowed[j] = true;
                    steps.push({
                        type: 'retenue_chain',
                        position: j,
                        expectedValue: workingNum[j].toString(),
                        hint: `Le 0 emprunte aussi. Écris dans la retenue des ${getPositionName(j)} ce qu'il devient après l'emprunt.`,
                        highlight: { position: j, type: 'retenue' }
                    });
                    j--;
                }

                if (j >= 0) {
                    steps.push({
                        type: 'bar',
                        position: j,
                        expectedBar: true,
                        hint: `Le ${workingNum[i]} des ${getPositionName(i)} est trop petit pour enlever ${digit2}. Barre le chiffre des ${getPositionName(j)} pour emprunter (clique et maintiens).`,
                        highlight: { position: j, type: 'minuend' }
                    });

                    workingNum[j]--;
                    hasBeenBorrowed[j] = true;
                    steps.push({
                        type: 'retenue',
                        position: j,
                        expectedValue: workingNum[j].toString(),
                        hint: `Le chiffre barré prête 1. Il perd 1. Écris dans la retenue des ${getPositionName(j)} combien il devient.`,
                        highlight: { position: j, type: 'retenue' }
                    });
                }

                if (hasBeenBorrowed[i]) {
                    steps.push({
                        type: 'add_ten_retenue',
                        position: i,
                        expectedValue: '1' + workingNum[i],
                        hint: `Le ${workingNum[i]} des ${getPositionName(i)} (dans la retenue) reçoit 10. Écris 1 devant pour faire ${workingNum[i] + 10} dans la retenue.`,
                        highlight: { position: i, type: 'retenue' }
                    });
                } else {
                    steps.push({
                        type: 'add_ten',
                        position: i,
                        expectedValue: '1',
                        hint: `Le ${originalNum[i]} des ${getPositionName(i)} reçoit 10. Écris un petit 1 à gauche pour montrer qu'il devient plus grand.`,
                        highlight: { position: i, type: 'smallone' }
                    });
                }
            }

            steps.push({
                type: 'result',
                position: i,
                expectedValue: null,
                hint: `Maintenant calcule la soustraction des ${getPositionName(i)} et écris le résultat dans la case du bas.`,
                highlight: { position: i, type: 'result' },
                hasBeenBorrowed: hasBeenBorrowed[i],
                workingDigit: workingNum[i],
                checkResult: (userSmallOnes, userRetenues, userResult) => {
                    let digit1Final;
                    if (hasBeenBorrowed[i]) {
                        const retenueValue = userRetenues[i];
                        digit1Final = retenueValue ? parseInt(retenueValue) : workingNum[i];
                    } else {
                        const hasSmallOne = userSmallOnes[i] === '1';
                        digit1Final = workingNum[i] + (hasSmallOne ? 10 : 0);
                    }
                    const expectedResult = (digit1Final - digit2).toString();
                    return userResult[i] === expectedResult;
                }
            });
        }

        return steps;
    };

    useEffect(() => {
        if (started) {
            const steps = calculateExpectedSteps();
            setExpectedSteps(steps);
            setCurrentStepIndex(0);
            if (steps.length > 0) {
                setCurrentHint(steps[0].hint);
                setHighlightPosition(steps[0].highlight.position);
                setHighlightType(steps[0].highlight.type);
            }
        }
    }, [started]);

    useEffect(() => {
        if (currentStepIndex < expectedSteps.length) {
            const step = expectedSteps[currentStepIndex];
            setCurrentHint(step.hint);
            setHighlightPosition(step.highlight.position);
            setHighlightType(step.highlight.type);
        } else if (expectedSteps.length > 0) {
            setCurrentHint('🎉 Bravo ! Tu as terminé la soustraction !');
            setHighlightPosition(null);
            setHighlightType('');
            setCompleted(true);
        }
    }, [currentStepIndex, expectedSteps]);

    const loadQuestion = (question: SubtractionQuestion) => {
        // Store the question but don't fill the cells - student must fill them
        setMinuend(['', '', '']);
        setSubtrahend(['', '', '']);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            loadQuestion(questions[nextIndex]);
            resetCurrentProblem();
        } else {
            // All questions completed
            setAllQuestionsCompleted(true);
        }
    };

    const resetCurrentProblem = () => {
        setStarted(false);
        setUserRetenues(['', '', '']);
        setUserSmallOnes(['', '', '']);
        setBarredCells([false, false, false]);
        setUserResult(['', '', '']);
        setCurrentStepIndex(0);
        setCompleted(false);
        setCurrentHint('');
        setHighlightPosition(null);
        setHighlightType('');
    };

    const collectReward = async () => {
        if (!hasCollectedReward && student?.id) {
            try {
                // addScore will automatically give nuggets based on calculateNuggets
                // We mark this as completion-based (score > 0 gives 2 nuggets)
                await addScore({
                    userId: student.id,
                    skill: 'subtraction-training',
                    score: 1, // Completion score
                    details: [{
                        question: 'Entraînement soustraction posée (3 calculs)',
                        userAnswer: 'Completed',
                        correctAnswer: 'Completed',
                        status: 'completed'
                    }]
                });
                setHasCollectedReward(true);
            } catch (error) {
                console.error('Error collecting reward:', error);
            }
        }
    };

    const checkAndAdvance = () => {
        if (currentStepIndex >= expectedSteps.length) return;

        const step = expectedSteps[currentStepIndex];
        let isCorrect = false;

        switch (step.type) {
            case 'bar':
                isCorrect = barredCells[step.position];
                break;
            case 'retenue':
            case 'retenue_chain':
                isCorrect = userRetenues[step.position] === step.expectedValue;
                break;
            case 'add_ten':
                isCorrect = userSmallOnes[step.position] === step.expectedValue;
                break;
            case 'add_ten_retenue':
                isCorrect = userRetenues[step.position] === step.expectedValue;
                break;
            case 'result':
                if (step.checkResult) {
                    isCorrect = step.checkResult(userSmallOnes, userRetenues, userResult);
                }
                break;
        }

        if (isCorrect) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    useEffect(() => {
        if (started) {
            checkAndAdvance();
        }
    }, [userRetenues, userSmallOnes, barredCells, userResult, started]);

    const startExercise = () => {
        const hasMinuend = minuend.some(d => d !== '');
        const hasSubtrahend = subtrahend.some(d => d !== '');

        if (hasMinuend && hasSubtrahend) {
            setStarted(true);
            setCurrentHint('Commence par les unités (à droite) !');
        }
    };

    const reset = () => {
        // Reset everything and restart from first question
        const questionSet = generateSubtractionTrainingSet();
        setQuestions(questionSet);
        setCurrentQuestionIndex(0);
        loadQuestion(questionSet[0]);
        setAllQuestionsCompleted(false);
        setHasCollectedReward(false);
        resetCurrentProblem();
    };

    const handleMouseDown = (index: number) => {
        if (!started) return;
        const timer = setTimeout(() => {
            const newBarred = [...barredCells];
            newBarred[index] = true;
            setBarredCells(newBarred);
        }, 500);
        setPressTimer(timer);
    };

    const handleMouseUp = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
    };

    // Show completion screen after all 3 questions
    if (allQuestionsCompleted) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <Card className="shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-center font-headline text-4xl text-green-700">
                            🎉 Félicitations ! 🎉
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-4">
                            <p className="text-2xl font-bold text-gray-800">
                                Tu as terminé les 3 soustractions !
                            </p>
                            <p className="text-lg text-gray-600">
                                Tu maîtrises maintenant la méthode de la soustraction posée.
                            </p>

                            {!hasCollectedReward ? (
                                <div className="mt-8">
                                    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-4 border-yellow-400">
                                        <CardContent className="p-6">
                                            <p className="text-xl font-bold text-amber-900 mb-4">
                                                🏆 Récompense : 2 pépites !
                                            </p>
                                            <Button
                                                onClick={collectReward}
                                                size="lg"
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xl px-8 py-6"
                                            >
                                                Récupérer mes pépites
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-4 border-green-400">
                                    <CardContent className="p-6">
                                        <p className="text-xl font-bold text-green-900">
                                            ✅ Pépites récupérées ! Continue comme ça !
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="mt-8">
                                <Button onClick={reset} size="lg" className="text-lg">
                                    <RotateCcw className="mr-2" />
                                    Recommencer un nouvel exercice
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="shadow-2xl mb-6">
                <CardHeader>
                    <CardTitle className="text-center font-headline text-3xl">
                        🎓 Entraînement guidé à la soustraction posée
                    </CardTitle>
                    <p className="text-center text-muted-foreground mt-2">
                        Suis les instructions étape par étape !
                    </p>
                    {/* Progress indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-16 h-2 rounded-full transition-all",
                                    i < currentQuestionIndex ? "bg-green-500" :
                                    i === currentQuestionIndex ? "bg-blue-500" :
                                    "bg-gray-300"
                                )}
                            />
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                        Calcul {currentQuestionIndex + 1} sur 3
                        {currentQuestionIndex === 0 && " (sans emprunt)"}
                        {currentQuestionIndex === 1 && " (1 emprunt)"}
                        {currentQuestionIndex === 2 && " (2 emprunts)"}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!started && questions.length > 0 && (
                        <Card className="bg-blue-50 border-2 border-blue-300">
                            <CardContent className="p-4">
                                <p className="text-lg font-bold text-blue-900 text-center mb-2">
                                    📝 Remplis les cases pour effectuer cette soustraction :
                                </p>
                                <p className="text-2xl font-bold text-blue-900 text-center">
                                    {questions[currentQuestionIndex].num1} − {questions[currentQuestionIndex].num2}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-center gap-3">
                        {!started ? (
                            <Button onClick={startExercise} size="lg" className="text-lg">
                                <Play className="mr-2" />
                                Commencer ce calcul
                            </Button>
                        ) : completed ? (
                            <Button onClick={nextQuestion} size="lg" className="text-lg bg-green-600 hover:bg-green-700">
                                <ChevronRight className="mr-2" />
                                Calcul suivant
                            </Button>
                        ) : (
                            <Button onClick={reset} variant="outline" size="lg" className="text-lg">
                                <RotateCcw className="mr-2" />
                                Recommencer tout
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <div className="inline-block relative">
                            {/* Labels C D U en haut */}
                            <div className="flex gap-3 mb-2">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="w-20 text-center text-sm text-gray-600 font-bold">
                                        {i === 0 ? 'C' : i === 1 ? 'D' : 'U'}
                                    </div>
                                ))}
                            </div>

                            {/* Ligne des retenues */}
                            <div className="flex gap-3 mb-2">
                                {[0, 1, 2].map((i) => {
                                    const colors = getColumnColorClasses(i);
                                    return (
                                        <div key={i} className="relative">
                                            {started && highlightPosition === i && highlightType === 'retenue' && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                                                    <ArrowDown className="text-yellow-500" />
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                maxLength={2}
                                                value={userRetenues[i]}
                                                onChange={(e) => {
                                                    const newRetenues = [...userRetenues];
                                                    newRetenues[i] = e.target.value;
                                                    setUserRetenues(newRetenues);
                                                }}
                                                disabled={!started}
                                                className={cn(
                                                    "w-20 h-14 border-2 border-dashed rounded-md text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all",
                                                    colors.border,
                                                    colors.bg,
                                                    colors.text,
                                                    colors.ring,
                                                    started && highlightPosition === i && highlightType === 'retenue' && 'ring-4 ring-yellow-400 scale-110',
                                                    !started && 'bg-gray-100 cursor-not-allowed'
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Ligne du minuende */}
                            <div className="flex gap-3 mb-3 relative items-center">
                                {[0, 1, 2].map((i) => {
                                    const colors = getColumnColorClasses(i);
                                    return (
                                        <div key={i} className="relative">
                                            {started && highlightPosition === i && highlightType === 'minuend' && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                                                    <ArrowDown className="text-yellow-500" />
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    "w-20 h-20 border-4 rounded-md flex items-center justify-center relative transition-all",
                                                    colors.border,
                                                    colors.bg,
                                                    started && 'cursor-pointer',
                                                    started && highlightPosition === i && highlightType === 'minuend' && 'ring-4 ring-yellow-400 scale-110'
                                                )}
                                                onMouseDown={() => handleMouseDown(i)}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                                onTouchStart={() => handleMouseDown(i)}
                                                onTouchEnd={handleMouseUp}
                                            >
                                                {!started ? (
                                                    <input
                                                        type="text"
                                                        maxLength={1}
                                                        value={minuend[i]}
                                                        onChange={(e) => {
                                                            if (e.target.value === '' || /^[0-9]$/.test(e.target.value)) {
                                                                const newMinuend = [...minuend];
                                                                newMinuend[i] = e.target.value;
                                                                setMinuend(newMinuend);
                                                            }
                                                        }}
                                                        className="w-full h-full text-center text-4xl font-bold bg-transparent outline-none"
                                                    />
                                                ) : (
                                                    <>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className={cn(
                                                                "text-4xl font-bold",
                                                                barredCells[i] ? 'text-gray-300 line-through decoration-4 decoration-red-500' : colors.text
                                                            )}>
                                                                {minuend[i]}
                                                            </div>
                                                        </div>
                                                        {/* Petit 1 à gauche */}
                                                        {started && highlightPosition === i && highlightType === 'smallone' && (
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                                                                <ArrowDown className="text-yellow-500" />
                                                            </div>
                                                        )}
                                                        <div className="absolute left-1 top-1">
                                                            <input
                                                                type="text"
                                                                maxLength={1}
                                                                value={userSmallOnes[i]}
                                                                onChange={(e) => {
                                                                    if (e.target.value === '' || e.target.value === '1') {
                                                                        const newSmallOnes = [...userSmallOnes];
                                                                        newSmallOnes[i] = e.target.value;
                                                                        setUserSmallOnes(newSmallOnes);
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "w-6 h-7 text-center text-sm font-bold bg-transparent border border-dashed border-red-400 rounded focus:ring-2 focus:ring-yellow-400 outline-none",
                                                                    highlightPosition === i && highlightType === 'smallone' && 'ring-2 ring-yellow-400'
                                                                )}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Ligne du subtrahend (soustracteur) */}
                            <div className="flex gap-3 mb-3 relative items-center">
                                <span className="absolute -left-8 text-2xl text-gray-600 font-bold">−</span>
                                {[0, 1, 2].map((i) => {
                                    const colors = getColumnColorClasses(i);
                                    return (
                                        <div key={i} className={cn(
                                            "w-20 h-20 border-4 rounded-md flex items-center justify-center",
                                            colors.border,
                                            colors.bg
                                        )}>
                                            {!started ? (
                                                <input
                                                    type="text"
                                                    maxLength={1}
                                                    value={subtrahend[i]}
                                                    onChange={(e) => {
                                                        if (e.target.value === '' || /^[0-9]$/.test(e.target.value)) {
                                                            const newSubtrahend = [...subtrahend];
                                                            newSubtrahend[i] = e.target.value;
                                                            setSubtrahend(newSubtrahend);
                                                        }
                                                    }}
                                                    className="w-full h-full text-center text-4xl font-bold bg-transparent outline-none"
                                                />
                                            ) : (
                                                <div className={cn("text-4xl font-bold", colors.text)}>
                                                    {subtrahend[i]}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Ligne de séparation */}
                            <div className="border-t-4 border-gray-800 mb-3"></div>

                            {/* Ligne du résultat */}
                            <div className="flex gap-3">
                                {[0, 1, 2].map((i) => {
                                    const colors = getColumnColorClasses(i);
                                    return (
                                        <div key={i} className="relative">
                                            {started && highlightPosition === i && highlightType === 'result' && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                                                    <ArrowDown className="text-yellow-500" />
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                maxLength={1}
                                                value={userResult[i]}
                                                onChange={(e) => {
                                                    const newResult = [...userResult];
                                                    newResult[i] = e.target.value;
                                                    setUserResult(newResult);
                                                }}
                                                disabled={!started}
                                                className={cn(
                                                    "w-20 h-20 border-4 rounded-md text-center text-4xl font-bold focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all",
                                                    colors.border,
                                                    colors.bg,
                                                    colors.text,
                                                    colors.ring,
                                                    started && highlightPosition === i && highlightType === 'result' && 'ring-4 ring-yellow-400 scale-110',
                                                    !started && 'bg-gray-100 cursor-not-allowed'
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {started && currentHint && (
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500">
                            <CardContent className="p-4">
                                <p className="text-lg font-bold text-blue-900 leading-relaxed">{currentHint}</p>
                            </CardContent>
                        </Card>
                    )}

                    {completed && (
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
                            <CardContent className="p-4">
                                <p className="text-2xl font-bold text-green-900 text-center">🎉 Parfait ! Tu as réussi toute la soustraction ! 🎉</p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-purple-700">📝 Comment utiliser cet outil ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">1️⃣</span>
                        <p><strong>Remplis les nombres</strong> : écris le nombre du haut et celui du bas, puis clique sur "Commencer".</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">👇</span>
                        <p><strong>Suis la flèche</strong> : elle te montre où agir.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">✨</span>
                        <p><strong>Case qui brille</strong> : c'est là que tu dois écrire ou barrer.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🖱️</span>
                        <p><strong>Pour barrer</strong> : clique et maintiens sur le chiffre pendant 0,5 seconde.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">1️⃣</span>
                        <p><strong>Petit 1</strong> : quand on te le demande, écris "1" dans la petite case en haut à gauche du chiffre.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🚀</span>
                        <p><strong>Automatique</strong> : dès que tu fais la bonne action, le conseil suivant apparaît !</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
