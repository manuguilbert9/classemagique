
'use client';

import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import type { SkillLevel } from '@/lib/skills';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bot, KeyRound, RefreshCw, Play, Trash2, Undo2, ThumbsUp, X, Loader2 } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from './ui/progress';
import { ScoreTube } from './score-tube';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { categoryStyles } from '@/lib/skills';
import { findShortestPath, type LevelData, type Move, type Position, type Tile } from '@/lib/exercise-content/chemin-code';
import { getPooledContent } from '@/services/exercise-pool';
import {
    AnswerFeedback,
    DELAI_NOUVEL_ESSAI,
    ExerciseFinished,
    ExerciseProgress,
    useSecondChance,
    type FeedbackStatus,
} from '@/components/exercise/exercise-kit';


const LEVEL_COUNT = 5;

export function CodedPathExercise() {
    const { student } = useContext(UserContext);
    const searchParams = useSearchParams();
    const isHomework = searchParams.get('from') === 'devoirs';
    const homeworkDate = searchParams.get('date');

    const [level, setLevel] = useState<SkillLevel | null>(null);
    const [currentLevelData, setCurrentLevelData] = useState<LevelData | null>(null);

    const [path, setPath] = useState<Move[]>([]);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackStatus>(null);
    // Le droit à l'erreur : un parcours raté se recommence, il ne se sanctionne pas.
    const secondChance = useSecondChance();
    const [isFinished, setIsFinished] = useState(false);
    const [sessionScores, setSessionScores] = useState<number[]>([]);
    const [hasBeenSaved, setHasBeenSaved] = useState(false);
    const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedPlayerPos, setSimulatedPlayerPos] = useState<Position | null>(null);
    const [realtimePlayerPos, setRealtimePlayerPos] = useState<Position | null>(null);
    const [brokenTraps, setBrokenTraps] = useState<Position[]>([]);

    const style = categoryStyles['Espace et géométrie'];

    useEffect(() => {
        if(student?.levels?.['coded-path']) {
            setLevel(student.levels['coded-path']);
        } else {
            setLevel('A');
        }
    }, [student]);
    
    // Les labyrinthes de la séance viennent du stock partagé.
    const [levels, setLevels] = useState<LevelData[]>([]);

    useEffect(() => {
        if (!level) return;
        const loadLevels = async () => {
            setLevels(await getPooledContent<LevelData>('coded-path', LEVEL_COUNT, {
                settings: { level },
                studentId: student?.id ?? null,
            }));
        };
        loadLevels();
    }, [level, student?.id]);

    useEffect(() => {
        const newLevelData = levels[currentLevelIndex];
        if (!newLevelData) return;
        setCurrentLevelData(newLevelData);
        setRealtimePlayerPos(newLevelData.playerStart);
        setBrokenTraps([]);
    }, [currentLevelIndex, levels]);

    const handleNextLevel = () => {
        setShowConfetti(false);
        if (currentLevelIndex < LEVEL_COUNT - 1) {
            setCurrentLevelIndex(prev => prev + 1);
            setPath([]);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };
    
    const checkPathForLevelB_or_C = () => {
        if (!currentLevelData || path.length === 0) return;
        setIsSimulating(true);
        setBrokenTraps([]);

        let pos = { ...currentLevelData.playerStart };
        let pathIsCorrect = false;
        let step = 0;
        let trapsTriggered: Position[] = [];

        const interval = setInterval(() => {
            if (step >= path.length) { // End of path
                pathIsCorrect = pos.x === currentLevelData.keyPos.x && pos.y === currentLevelData.keyPos.y;
                clearInterval(interval);
                finalizeCheck(pathIsCorrect, path);
                return;
            }

            const move = path[step];
            if (move === 'up') pos.y--;
            if (move === 'down') pos.y++;
            if (move === 'left') pos.x--;
            if (move === 'right') pos.x++;
            
            if (pos.y < 0 || pos.y >= currentLevelData.grid.length || pos.x < 0 || pos.x >= currentLevelData.grid[0].length || currentLevelData.grid[pos.y][pos.x] === 'wall' || trapsTriggered.some(t => t.x === pos.x && t.y === pos.y)) {
                pathIsCorrect = false;
                clearInterval(interval);
                finalizeCheck(false, path);
                return;
            }

            if(currentLevelData.grid[pos.y][pos.x] === 'trap') {
                trapsTriggered.push({...pos});
                setBrokenTraps(prev => [...prev, {...pos}]);
                pathIsCorrect = false;
                clearInterval(interval);
                finalizeCheck(false, path);
                return;
            }
            
            setSimulatedPlayerPos({ ...pos });
            step++;
        }, 200);
    };

    const handleRealtimeMove = (move: Move) => {
        if (!realtimePlayerPos || !currentLevelData || feedback) return;

        let nextPos = { ...realtimePlayerPos };
        if (move === 'up') nextPos.y--;
        if (move === 'down') nextPos.y++;
        if (move === 'left') nextPos.x--;
        if (move === 'right') nextPos.x++;

        const { y, x } = nextPos;
        if (y < 0 || y >= currentLevelData.grid.length || x < 0 || x >= currentLevelData.grid[0].length || currentLevelData.grid[y][x] === 'wall' || brokenTraps.some(t => t.x === x && t.y === y)) {
            setFeedback('incorrect');
            setTimeout(() => setFeedback(null), 500);
            return;
        }
        
        if (currentLevelData.grid[y][x] === 'trap') {
            setBrokenTraps(prev => [...prev, { x, y }]);
            setFeedback('incorrect');
            setTimeout(() => setFeedback(null), 500);
            return;
        }

        const newPath = [...path, move];
        setPath(newPath);
        setRealtimePlayerPos(nextPos);
        
        if (nextPos.x === currentLevelData.keyPos.x && nextPos.y === currentLevelData.keyPos.y) {
            finalizeCheck(true, newPath);
        }
    };


    const finalizeCheck = (isCorrect: boolean, userPath: Move[]) => {
         let score = 0;
         if (isCorrect && currentLevelData) {
            const shortestPath = findShortestPath(currentLevelData.grid, currentLevelData.playerStart, currentLevelData.keyPos);
            const shortestLength = shortestPath ? shortestPath.length - 1 : 0;
            const userLength = userPath.length;

            if (shortestLength > 0 && userLength >= shortestLength) {
                const wastedMoves = userLength - shortestLength;
                score = Math.max(0, 100 - (wastedMoves * 5));
            } else {
                 score = 100; // Should not happen with BFS but a good fallback
            }
        }
        // Parcours raté : rien n'est consigné, l'élève refait son programme.
        // Le labyrinthe ne change pas : c'est en le recommençant qu'il comprend.
        if (!isCorrect) {
            secondChance.registerError();
            setFeedback('retry');
            setTimeout(() => {
                setIsSimulating(false);
                setSimulatedPlayerPos(null);
                setFeedback(null);
            }, DELAI_NOUVEL_ESSAI);
            return;
        }

        const issue = secondChance.resultOnSuccess();
        // Un parcours réussi après tâtonnement ne rapporte pas de points.
        const scoreRetenu = issue === 'correct' ? score : 0;
        setSessionScores(prev => [...prev, scoreRetenu]);
        setSessionDetails(prev => [...prev, {
            question: `Parcours ${currentLevelIndex + 1}`,
            userAnswer: userPath.join(', '),
            correctAnswer: 'Chemin valide',
            status: issue,
            score: scoreRetenu
        }]);

        setFeedback(issue);
        setShowConfetti(true);

        setTimeout(() => {
            setIsSimulating(false);
            setSimulatedPlayerPos(null);
            secondChance.reset();
            handleNextLevel();
        }, 2000);
    }

    const addMove = (move: Move) => {
        if (level === 'A') {
            handleRealtimeMove(move);
        } else {
            if (isSimulating || feedback) return;
            setPath(prev => [...prev, move]);
        }
    }
    const removeLastMove = () => {
        if (isSimulating || feedback) return;
        setPath(prev => prev.slice(0, -1));
    }
    const clearPath = () => {
        if (isSimulating || feedback) return;
        setPath([]);
    }

     useEffect(() => {
        const saveResult = async () => {
             if (isFinished && student && !hasBeenSaved && level) {
                setHasBeenSaved(true);
                const finalScore = sessionScores.length > 0 ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length : 0;

                if (isHomework && homeworkDate) {
                    await saveHomeworkResult({ userId: student.id, date: homeworkDate, skillSlug: 'coded-path', score: finalScore });
                } else {
                    await addScore({ userId: student.id, skill: 'coded-path', score: finalScore, details: sessionDetails, numberLevelSettings: { level } });
                }
            }
        };
        saveResult();
    }, [isFinished, student, hasBeenSaved, sessionDetails, isHomework, homeworkDate, level, sessionScores]);

    const restartExercise = () => {
        setCurrentLevelIndex(0);
        setIsFinished(false);
        setSessionScores([]);
        setHasBeenSaved(false);
        setSessionDetails([]);
    };
    
    if (!level) {
        return (
            <Card className={cn("w-full max-w-lg mx-auto shadow-2xl p-6", style.bg, style.text)}>
                <CardHeader>
                    <CardTitle>Choisis ton niveau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label>Niveau de difficulté</Label>
                    <Select onValueChange={(val) => setLevel(val as SkillLevel)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un niveau..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="A">Niveau A (Déplacement direct)</SelectItem>
                            <SelectItem value="B">Niveau B (Programmation simple)</SelectItem>
                            <SelectItem value="C">Niveau C (Labyrinthe & Pièges)</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        );
    }
    
    if (!currentLevelData) {
        return <Card className="w-full shadow-2xl p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></Card>;
    }

    if (isFinished) {
        return (
            <ExerciseFinished
                correct={sessionScores.filter(s => s > 0).length}
                total={LEVEL_COUNT}
                canRestart={!isHomework}
                onRestart={restartExercise}
                returnHref={isHomework ? '/devoirs' : '/en-classe'}
                returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
            />
        );
    }
    
    const playerPos = level === 'A' ? realtimePlayerPos : (simulatedPlayerPos || currentLevelData.playerStart);
    if (!playerPos) return null; // Should not happen
    
    const isSmallGrid = level !== 'C';
    const tileSize = isSmallGrid ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-8 h-8';
    const iconSize = isSmallGrid ? 'h-8 w-8 sm:h-10 sm:h-10' : 'h-6 w-6';
    const textSize = isSmallGrid ? 'text-3xl sm:text-4xl' : 'text-xl';

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3}} />
            </div>
            <CardHeader>
                <CardTitle className="text-center font-headline text-3xl">Parcours Codé</CardTitle>
                <CardDescription className="text-center">Guidez le robot jusqu'à la clé.</CardDescription>
                <ExerciseProgress
                    current={currentLevelIndex}
                    total={LEVEL_COUNT}
                    results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')}
                    className="mt-4"
                />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center">
                     <div className={cn("grid border-2 bg-muted/20", feedback === 'retry' && level === 'A' && 'animate-shake')} style={{gridTemplateColumns: `repeat(${currentLevelData.grid[0].length}, 1fr)`}}>
                        {currentLevelData.grid.map((row, y) => 
                            row.map((tile, x) => {
                                const isPlayerHere = playerPos.x === x && playerPos.y === y;
                                const isStart = currentLevelData.playerStart.x === x && currentLevelData.playerStart.y === y;
                                const isKey = currentLevelData.keyPos.x === x && currentLevelData.keyPos.y === y;
                                const isBroken = brokenTraps.some(t => t.x === x && t.y === y);
                                return (
                                    <div key={`${y}-${x}`} className={cn("relative flex items-center justify-center border", textSize, tileSize,
                                      isStart && 'bg-blue-200/50',
                                      isKey && 'bg-yellow-200/50',
                                      tile === 'trap' && !isBroken && 'border-dashed border-slate-400/50'
                                    )}>
                                        {isPlayerHere && <Bot className={cn(iconSize, "text-blue-600 z-10")}/>}
                                        {tile === 'wall' && <div className="w-full h-full bg-slate-600"/>}
                                        {isBroken && <div className="w-full h-full bg-black"/>}
                                        {isKey && !isPlayerHere && <KeyRound className={cn(iconSize, "text-yellow-500")}/>}
                                    </div>
                                )
                           })
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {level !== 'A' && (
                        <div className="p-4 rounded-lg bg-muted min-h-[6rem]">
                            <p className="text-sm text-muted-foreground mb-2">Chemin programmé :</p>
                            <div className="flex flex-wrap gap-1">
                                {path.map((move, i) => {
                                    if (move === 'up') return <ArrowUp key={i} className="h-8 w-8 text-secondary-foreground"/>
                                    if (move === 'down') return <ArrowDown key={i} className="h-8 w-8 text-secondary-foreground"/>
                                    if (move === 'left') return <ArrowLeft key={i} className="h-8 w-8 text-secondary-foreground"/>
                                    if (move === 'right') return <ArrowRight key={i} className="h-8 w-8 text-secondary-foreground"/>
                                    return null;
                                })}
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2">
                        <div></div>
                        <Button variant="outline" size="lg" className="h-16" onClick={() => addMove('up')}><ArrowUp className="h-8 w-8"/></Button>
                        <div></div>
                        <Button variant="outline" size="lg" className="h-16" onClick={() => addMove('left')}><ArrowLeft className="h-8 w-8"/></Button>
                        <Button variant="outline" size="lg" className="h-16" onClick={() => addMove('down')}><ArrowDown className="h-8 w-8"/></Button>
                        <Button variant="outline" size="lg" className="h-16" onClick={() => addMove('right')}><ArrowRight className="h-8 w-8"/></Button>
                    </div>

                     {level !== 'A' && (
                        <div className="flex gap-2">
                            <Button variant="outline" className="w-full" onClick={removeLastMove}><Undo2 className="mr-2 h-4 w-4"/>Annuler</Button>
                            <Button variant="destructive" className="w-full" onClick={clearPath}><Trash2 className="mr-2 h-4 w-4"/>Effacer</Button>
                        </div>
                     )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6">
                {level !== 'A' && (
                    <Button size="lg" className="w-full max-w-md" onClick={checkPathForLevelB_or_C} disabled={isSimulating || feedback !== null}>
                        <Play className="mr-2"/> Lancer le robot !
                    </Button>
                )}
                <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="w-full max-w-md">
                    {feedback === 'retry'
                        ? 'Le robot ne trouve pas la clé. Regarde où il s’est arrêté et corrige ton programme.'
                        : undefined}
                </AnswerFeedback>
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
