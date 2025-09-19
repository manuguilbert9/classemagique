
'use client';

import { useState, useMemo, useEffect, useContext, useCallback, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Loader2, Check, X } from 'lucide-react';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { Progress } from '@/components/ui/progress';
import { ScoreTube } from './score-tube';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '@/lib/skills';
import { type CalculationState } from '@/services/scores';

type OperationType = 'addition' | 'subtraction';
type Problem = {
    id: number;
    operands: number[];
    operation: OperationType;
    answer: number;
};
type Feedback = 'correct' | 'incorrect' | null;

const NUM_PROBLEMS = 3;

function CarryNoteInput({
    cellId,
    value,
    isCrossed,
    onChange,
    onToggleCrossed,
}: {
    cellId: string;
    value: string;
    isCrossed?: boolean;
    onChange: (id: string, value: string) => void;
    onToggleCrossed: (id: string) => void;
}) {
    const colorClass = useMemo(() => {
        const column = parseInt(cellId.split('-')[1], 10);
        if (column === 0) return 'text-blue-600 border-blue-400 focus-within:ring-blue-300';
        if (column === 1) return 'text-red-600 border-red-400 focus-within:ring-red-300';
        if (column === 2) return 'text-green-600 border-green-400 focus-within:ring-green-300';
        return 'text-gray-600 border-gray-400 focus-within:ring-gray-300';
    }, [cellId]);

    return (
        <label
            htmlFor={cellId}
            className={cn(
                'relative flex h-8 w-8 cursor-text items-center justify-center rounded-full border-2 border-dashed bg-background text-sm font-semibold transition focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background sm:h-10 sm:w-10 sm:text-base',
                colorClass,
                isCrossed && 'focus-within:border-destructive/70 focus-within:ring-destructive/40'
            )}
            onContextMenu={(event) => {
                event.preventDefault();
                onToggleCrossed(cellId);
            }}
        >
            <input
                id={cellId}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={value}
                onChange={(event) => {
                    const sanitized = event.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 2);
                    onChange(cellId, sanitized);
                }}
                onFocus={(event) => event.currentTarget.select()}
                className="absolute inset-0 h-full w-full cursor-text rounded-full border-none bg-transparent text-center text-base font-semibold text-transparent caret-primary focus:outline-none"
                aria-label="Retenue"
            />
            <span
                className={cn(
                    'pointer-events-none text-base font-semibold text-foreground transition-colors',
                    !value && 'text-muted-foreground',
                    isCrossed && 'line-through decoration-4 decoration-destructive'
                )}
            >
                {value || ''}
            </span>
        </label>
    );
}


// --- Problem Generation Logic ---

const generateNumber = (digits: number): number => {
    if (digits < 1) return 0;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateAddition = (numOperands: number, digits: number, withCarry: boolean): Problem => {
    let operands: number[] = [];
    let sum = 0;
    let attempts = 0;
    
    while (attempts < 50) {
        attempts++;
        operands = Array.from({ length: numOperands }, () => generateNumber(digits));
        sum = operands.reduce((acc, op) => acc + op, 0);

        if (!withCarry) {
            let hasCarry = false;
            let tempSum = 0;
            for (let d = 0; d < digits; d++) {
                const columnSum = operands.reduce((acc, op) => acc + (Math.floor(op / Math.pow(10, d)) % 10), 0) + Math.floor(tempSum / 10);
                if (columnSum >= 10) {
                    hasCarry = true;
                    break;
                }
                tempSum = columnSum;
            }
            if (!hasCarry) break;
        } else {
            let hasCarry = false;
            let tempSum = 0;
             for (let d = 0; d < digits; d++) {
                const columnSum = operands.reduce((acc, op) => acc + (Math.floor(op / Math.pow(10, d)) % 10), 0) + Math.floor(tempSum / 10);
                if (columnSum >= 10) {
                    hasCarry = true;
                    break;
                }
                 tempSum = columnSum;
            }
            if (hasCarry) break;
        }
    }
    if (attempts >= 50) {
        if (withCarry) {
             operands = Array.from({ length: numOperands - 1 }, () => generateNumber(digits > 1 ? digits -1 : 1)).concat([Number("9".repeat(digits > 1 ? digits - 1 : 1))]);
        } else {
             operands = Array.from({ length: numOperands }, () => Number("1".repeat(digits)));
        }
        sum = operands.reduce((a, b) => a + b, 0);
    }
    
    return { id: Date.now() + Math.random(), operands, operation: 'addition', answer: sum };
};


const generateSubtraction = (digits: number, withCarry: boolean): Problem => {
    let op1 = 0, op2 = 0;
    let attempts = 0;

    while (attempts < 50) {
        attempts++;
        op1 = generateNumber(digits);
        op2 = generateNumber(digits);

        if (op1 <= op2) {
            [op1, op2] = [op2, op1];
            if (op1 === op2) op1++;
        }
        
        if (op1 === 0 || op2 === 0) continue;

        let hasCarry = false;
        for (let d = 0; d < digits; d++) {
            const d1 = Math.floor(op1 / Math.pow(10, d)) % 10;
            const d2 = Math.floor(op2 / Math.pow(10, d)) % 10;
            let effectiveD1 = d1;
            
            if(d > 0) {
              const prevD1 = Math.floor(op1 / Math.pow(10, d - 1)) % 10;
              const prevD2 = Math.floor(op2 / Math.pow(10, d - 1)) % 10;
              if (prevD1 < prevD2) {
                effectiveD1 -= 1;
              }
            }

            if (effectiveD1 < d2) {
                hasCarry = true;
                break;
            }
        }
        if (hasCarry === withCarry) break;
    }
    
    if (attempts >= 50) {
        if(withCarry) {
            op1 = parseInt(`5` + '0'.repeat(digits - 1));
            op2 = 1;
        } else {
            op1 = parseInt('9'.repeat(digits));
            op2 = parseInt('1'.repeat(digits));
        }
    }

    return { id: Date.now() + Math.random(), operands: [op1, op2], operation: 'subtraction', answer: op1 - op2 };
};


export function LongCalculationExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [level, setLevel] = useState<SkillLevel | null>(null);
    
    const [problems, setProblems] = useState<Problem[]>([]);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [calculationState, setCalculationState] = useState<CalculationState>({});
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

    const generateProblemsForLevel = useCallback((lvl: SkillLevel) => {
        let newProblems: Problem[] = [];
        switch (lvl) {
            case 'B':
                newProblems = [
                    generateAddition(2, 2, false),
                    generateSubtraction(2, false),
                    generateAddition(2, 2, true)
                ];
                break;
            case 'C':
                 newProblems = [
                    generateAddition(2, 3, true),
                    generateSubtraction(3, true),
                    generateSubtraction(3, true),
                ];
                break;
            case 'D':
                newProblems = [
                    generateAddition(3, 4, true),
                    generateSubtraction(4, true),
                    generateSubtraction(4, true),
                ];
                break;
        }
        setProblems(newProblems.sort(() => Math.random() - 0.5));
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        if(level === null && student) {
             const studentLevel = student.levels?.['long-calculation'] || 'B';
             setLevel(studentLevel);
        } else if (level === null && !student) {
             setLevel('B');
        }
    }, [student, level]);

    useEffect(() => {
        if (level !== null) {
            setIsLoading(true);
            generateProblemsForLevel(level);
        }
    }, [level, generateProblemsForLevel]);


    const currentProblem = useMemo(() => {
        if (problems.length > 0) {
            return problems[currentProblemIndex];
        }
        return null;
    }, [problems, currentProblemIndex]);

    const handleInputChange = useCallback((id: string, value: string) => {
        setCalculationState(prev => ({
            ...prev,
            [id]: { ...(prev[id] || { isCrossed: false }), value }
        }));
    }, []);

    const handleToggleCrossed = useCallback((id: string) => {
        setCalculationState(prev => ({
            ...prev,
            [id]: { ...(prev[id] || { value: '' }), isCrossed: !(prev[id]?.isCrossed) }
        }));
    }, []);

    const handleValidate = () => {
        if (!currentProblem) return;

        let userAnswerStr = '';
        const numCols = String(Math.max(...currentProblem.operands, currentProblem.answer)).length;
        for (let i = numCols; i >= 0; i--) {
             const cellValue = calculationState[`result-${i}`]?.value || '';
             const cleanValue = cellValue.length === 2 && cellValue.startsWith('1') ? cellValue.substring(1) : cellValue;
             userAnswerStr += cleanValue;
        }
        const userAnswerNum = parseInt(userAnswerStr, 10) || 0;
        const isCorrect = userAnswerNum === currentProblem.answer;
        
         const detail: ScoreDetail = {
            question: currentProblem.operands.join(` ${currentProblem.operation === 'addition' ? '+' : '-'} `),
            userAnswer: userAnswerStr,
            correctAnswer: String(currentProblem.answer),
            status: isCorrect ? 'correct' : 'incorrect',
            calculationState: calculationState
        };
        setSessionDetails(prev => [...prev, detail]);

        if (isCorrect) {
            setFeedback('correct');
            setCorrectAnswers(prev => prev + 1);
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            if (currentProblemIndex < NUM_PROBLEMS - 1) {
                setCurrentProblemIndex(prev => prev + 1);
                setCalculationState({});
                setFeedback(null);
            } else {
                setIsFinished(true);
            }
        }, 2000);
    };

    useEffect(() => {
        const saveFinalScore = async () => {
             if (isFinished && student && !hasBeenSaved && level) {
                setHasBeenSaved(true);
                const score = (correctAnswers / NUM_PROBLEMS) * 100;
                
                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({
                        userId: student.id,
                        date: homeworkDate,
                        skillSlug: 'long-calculation',
                        score: score,
                    });
                } else {
                    await addScore({
                        userId: student.id,
                        skill: 'long-calculation',
                        score: score,
                        numberLevelSettings: { level: level },
                        details: sessionDetails,
                    });
                }
            }
        }
        saveFinalScore();
    }, [isFinished, student, correctAnswers, hasBeenSaved, level, sessionDetails, isHomework, homeworkDate]);

    const restartExercise = () => {
        setIsLoading(true);
        if (level) {
            generateProblemsForLevel(level);
        }
        setCurrentProblemIndex(0);
        setCalculationState({});
        setFeedback(null);
        setIsFinished(false);
        setCorrectAnswers(0);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };
    
    // --- All hooks are above this line ---

    if (isLoading || !level || problems.length === 0 || !currentProblem) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-6 h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Génération des calculs...</p>
            </div>
        );
    }

    if (isFinished) {
        const score = (correctAnswers / NUM_PROBLEMS) * 100;
        return (
             <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
                <CardHeader>
                    <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as obtenu <span className="font-bold text-primary">{correctAnswers}</span> bonnes réponses sur <span className="font-bold">{NUM_PROBLEMS}</span>.
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
        )
    }
    
    const { operands, operation } = currentProblem;
    const symbol = operation === 'addition' ? '+' : '-';
    const statement = operands.join(` ${symbol} `);
    const maxDigits = Math.max(
        ...operands.map((operand) => operand.toString().length),
        currentProblem.answer.toString().length
    );
    const totalColumns = maxDigits;
    const columnIndices = Array.from({ length: totalColumns }, (_, idx) => totalColumns - 1 - idx);

    const getOperandDigit = (operand: number, columnIndex: number) => {
        const digits = operand.toString();
        if (columnIndex >= digits.length) {
            return '';
        }
        return digits[digits.length - 1 - columnIndex];
    };

    const gridTemplateStyle = { gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 3.5rem))` };
    
    const columnColors = [
        'border-blue-400', 
        'border-red-400', 
        'border-green-400', 
        'border-yellow-400', 
        'border-purple-400'
    ];
    const columnTextColors = [
        'text-blue-600', 
        'text-red-600', 
        'text-green-600', 
        'text-yellow-600', 
        'text-purple-600'
    ];

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6">
            <Progress value={((currentProblemIndex + 1) / NUM_PROBLEMS) * 100} className="w-full" />
             <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-center font-body text-2xl sm:text-3xl">
                        Pose et calcule : <span className="font-numbers font-bold text-primary">{statement}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 sm:pt-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="space-y-1">
                            {/* Retenues */}
                            <div className="grid gap-2 h-12" style={gridTemplateStyle}>
                                {columnIndices.map((columnIndex) =>
                                    <div key={`carry-${columnIndex}`} className="flex justify-center items-center">
                                       <CarryNoteInput
                                            cellId={`carry-${columnIndex}`}
                                            value={calculationState[`carry-${columnIndex}`]?.value || ''}
                                            isCrossed={calculationState[`carry-${columnIndex}`]?.isCrossed}
                                            onChange={handleInputChange}
                                            onToggleCrossed={handleToggleCrossed}
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Operands */}
                            {operands.map((operand, operandIndex) => (
                                <div key={`operand-row-${operandIndex}`} className="flex items-center gap-2">
                                    <div className="w-8 text-2xl font-bold text-primary flex justify-center">
                                        {operandIndex === operands.length - 1 ? symbol : ''}
                                    </div>
                                    <div className="grid gap-2" style={gridTemplateStyle}>
                                        {columnIndices.map((columnIndex) =>
                                            <div key={`op-${operandIndex}-${columnIndex}`} className="relative flex h-14 w-14 items-center justify-center rounded-md border-2 border-muted bg-muted/20 text-3xl font-bold">
                                                 <button
                                                    type="button"
                                                    onClick={() => handleToggleCrossed(`op-${operandIndex}-${columnIndex}`)}
                                                    className={cn(
                                                        "transition-all",
                                                        calculationState[`op-${operandIndex}-${columnIndex}`]?.isCrossed && "line-through decoration-4 decoration-destructive"
                                                    )}
                                                >
                                                    {getOperandDigit(operand, columnIndex)}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Separator */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 text-2xl font-bold text-primary" />
                                <div className="grid gap-2 w-full" style={gridTemplateStyle}>
                                    <div className="col-span-full border-b-4 border-foreground" />
                                </div>
                            </div>
                            {/* Result */}
                            <div className="grid gap-2" style={gridTemplateStyle}>
                                {columnIndices.map((columnIndex) => {
                                    const colorIndex = columnIndex % columnColors.length;
                                    return (
                                        <input
                                            key={`result-${columnIndex}`}
                                            id={`result-${columnIndex}`}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={calculationState[`result-${columnIndex}`]?.value || ''}
                                            onChange={(e) => handleInputChange(`result-${columnIndex}`, e.target.value.replace(/[^0-9]/g, ''))}
                                            onFocus={(e) => e.currentTarget.select()}
                                            className={cn("h-14 w-14 rounded-md border-2 bg-background text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-offset-2",
                                                columnColors[colorIndex],
                                                `focus:ring-${columnColors[colorIndex].replace('border-','').replace('-400','')}-300`
                                            )}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="w-full">
                <Button onClick={handleValidate} size="lg" className={cn("w-full text-lg",
                    feedback === 'correct' && 'bg-green-500 hover:bg-green-600',
                    feedback === 'incorrect' && 'bg-red-500 hover:bg-red-500',
                )} disabled={!!feedback}>
                    {feedback === 'correct' && <Check className="mr-2"/>}
                    {feedback === 'incorrect' && <X className="mr-2"/>}
                    Valider ma réponse
                </Button>
            </div>
        </div>
    );
}
