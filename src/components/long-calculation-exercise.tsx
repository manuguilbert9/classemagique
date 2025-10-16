
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

// Fonction pour déterminer la couleur d'une colonne (unités, dizaines, centaines, etc.)
function getColumnColorClasses(columnIndex: number) {
    const colors = [
        {
            border: 'border-blue-400',
            text: 'text-blue-700',
            bg: 'bg-blue-50',
            ring: 'focus-within:ring-blue-300'
        }, // Unités
        {
            border: 'border-red-400',
            text: 'text-red-700',
            bg: 'bg-red-50',
            ring: 'focus-within:ring-red-300'
        }, // Dizaines
        {
            border: 'border-green-400',
            text: 'text-green-700',
            bg: 'bg-green-50',
            ring: 'focus-within:ring-green-300'
        }, // Centaines
        {
            border: 'border-gray-500',
            text: 'text-gray-700',
            bg: 'bg-gray-50',
            ring: 'focus-within:ring-gray-300'
        }, // Au-delà
    ];
    return colors[Math.min(columnIndex, colors.length - 1)];
}

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
    const columnIndex = parseInt(cellId.split('-')[1], 10);
    const colors = getColumnColorClasses(columnIndex);

    return (
        <div
            className="relative flex h-10 w-10 items-center justify-center cursor-pointer group"
            onClick={() => {
                // Clic simple pour barrer/débarrer
                if (value) {
                    onToggleCrossed(cellId);
                }
            }}
        >
            <label
                htmlFor={cellId}
                className={cn(
                    'relative flex h-10 w-10 cursor-text items-center justify-center rounded-md border-2 border-dashed text-sm font-bold transition-all',
                    colors.border,
                    colors.bg,
                    colors.text,
                    colors.ring,
                    'focus-within:ring-2 focus-within:ring-offset-1',
                    isCrossed && 'opacity-60',
                    !value && 'border-opacity-30'
                )}
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
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 h-full w-full cursor-text rounded-md border-none bg-transparent text-center text-sm font-bold text-transparent caret-primary focus:outline-none"
                    aria-label="Retenue ou emprunt"
                />
                <span
                    className={cn(
                        'pointer-events-none text-sm font-bold transition-all',
                        isCrossed && 'line-through decoration-2 decoration-red-600'
                    )}
                >
                    {value || ''}
                </span>
            </label>
            {/* Indicateur pour montrer qu'on peut cliquer pour barrer */}
            {value && !isCrossed && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                        ✕
                    </div>
                </div>
            )}
        </div>
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
                            {/* Labels C D U en haut */}
                            <div className="flex items-center gap-2">
                                <div className="w-8" />
                                <div className="grid gap-2" style={gridTemplateStyle}>
                                    {columnIndices.map((columnIndex) => {
                                        const label = columnIndex === 0 ? 'U' : columnIndex === 1 ? 'D' : columnIndex === 2 ? 'C' : '';
                                        return (
                                            <div key={`label-${columnIndex}`} className="flex justify-center items-center h-6">
                                                <span className="text-sm font-bold text-gray-600">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
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
                            {/* Operands avec annotations au-dessus */}
                            {operands.map((operand, operandIndex) => (
                                <Fragment key={`operand-row-${operandIndex}`}>
                                    {/* Annotations au-dessus de chaque opérande (uniquement pour les soustractions) */}
                                    {operation === 'subtraction' && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8" />
                                            <div className="grid gap-2" style={gridTemplateStyle}>
                                                {columnIndices.map((columnIndex) => {
                                                    const colors = getColumnColorClasses(columnIndex);
                                                    return (
                                                        <div key={`annotation-${operandIndex}-${columnIndex}`} className="flex justify-center items-center h-8">
                                                            <input
                                                                id={`annotation-${operandIndex}-${columnIndex}`}
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={1}
                                                                value={calculationState[`annotation-${operandIndex}-${columnIndex}`]?.value || ''}
                                                                onChange={(e) => handleInputChange(`annotation-${operandIndex}-${columnIndex}`, e.target.value.replace(/[^0-9]/g, ''))}
                                                                onFocus={(e) => e.currentTarget.select()}
                                                                placeholder="•"
                                                                className={cn(
                                                                    "h-8 w-8 rounded-md border border-dashed text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all",
                                                                    colors.border,
                                                                    colors.bg,
                                                                    colors.text,
                                                                    colors.ring,
                                                                    "placeholder:text-muted-foreground/30"
                                                                )}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {/* Chiffres de l'opérande */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 text-2xl font-bold text-primary flex justify-center">
                                            {/* Pour les soustractions, afficher le symbole seulement sur la dernière ligne (subtrahend) */}
                                            {/* Pour les additions, afficher le symbole sur toutes les lignes sauf la première */}
                                            {operation === 'subtraction'
                                                ? (operandIndex === operands.length - 1 ? symbol : '')
                                                : (operandIndex > 0 ? symbol : '')
                                            }
                                        </div>
                                        <div className="grid gap-2" style={gridTemplateStyle}>
                                            {columnIndices.map((columnIndex) => {
                                                const colors = getColumnColorClasses(columnIndex);
                                                const digit = getOperandDigit(operand, columnIndex);
                                                const isCrossed = calculationState[`op-${operandIndex}-${columnIndex}`]?.isCrossed;

                                                return (
                                                    <div
                                                        key={`op-${operandIndex}-${columnIndex}`}
                                                        className={cn(
                                                            "relative flex h-14 w-14 items-center justify-center rounded-md border-2 text-3xl font-bold transition-all",
                                                            colors.border,
                                                            digit ? colors.bg : 'bg-muted/10',
                                                            isCrossed && 'opacity-60',
                                                            operation === 'subtraction' && digit && 'cursor-pointer group hover:scale-105'
                                                        )}
                                                        onClick={() => {
                                                            // Le barrage n'est possible que pour les soustractions
                                                            if (operation === 'subtraction' && digit) {
                                                                handleToggleCrossed(`op-${operandIndex}-${columnIndex}`);
                                                            }
                                                        }}
                                                    >
                                                        <span className={cn(
                                                            "transition-all",
                                                            colors.text,
                                                            isCrossed && "line-through decoration-[3px] decoration-red-600"
                                                        )}>
                                                            {digit}
                                                        </span>
                                                        {/* Indicateur pour montrer qu'on peut cliquer pour barrer (uniquement pour les soustractions) */}
                                                        {operation === 'subtraction' && digit && !isCrossed && (
                                                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                                                                    ✕
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Fragment>
                            ))}
                            {/* Separator */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 text-2xl font-bold text-primary" />
                                <div className="grid gap-2 w-full" style={gridTemplateStyle}>
                                    <div className="col-span-full border-b-4 border-foreground" />
                                </div>
                            </div>
                            {/* Result */}
                            <div className="flex items-center gap-2">
                                <div className="w-8" />
                                <div className="grid gap-2" style={gridTemplateStyle}>
                                {columnIndices.map((columnIndex) => {
                                    const colors = getColumnColorClasses(columnIndex);
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
                                            className={cn(
                                                "h-14 w-14 rounded-md border-2 text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
                                                colors.border,
                                                colors.bg,
                                                colors.text,
                                                colors.ring
                                            )}
                                        />
                                    );
                                })}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="w-full space-y-3">
                <Button onClick={handleValidate} size="lg" className={cn("w-full text-lg",
                    feedback === 'correct' && 'bg-green-500 hover:bg-green-600',
                    feedback === 'incorrect' && 'bg-red-500 hover:bg-red-500',
                )} disabled={!!feedback}>
                    {feedback === 'correct' && <Check className="mr-2"/>}
                    {feedback === 'incorrect' && <X className="mr-2"/>}
                    Valider ma réponse
                </Button>

                {/* Aide visuelle */}
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-3">
                        <div className="text-xs space-y-1 text-muted-foreground">
                            <p className="font-semibold text-foreground mb-2">💡 Aide :</p>
                            <p>• Utilise les <span className="font-semibold">cases en pointillé du haut</span> pour les retenues</p>
                            {operation === 'subtraction' && (
                                <>
                                    <p>• <span className="font-semibold">Clique</span> sur un chiffre pour le barrer (soustraction)</p>
                                    <p>• Utilise les <span className="font-semibold">petites cases au-dessus</span> pour noter les emprunts</p>
                                </>
                            )}
                            <p>• <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mx-1"></span> Unités, <span className="inline-block w-3 h-3 rounded-full bg-red-400 mx-1"></span> Dizaines, <span className="inline-block w-3 h-3 rounded-full bg-green-400 mx-1"></span> Centaines</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
