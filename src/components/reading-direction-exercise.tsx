
'use client';

import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, RefreshCw, Star } from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-dom-confetti';
import { UserContext } from '@/context/user-context';
import type { GrilleDeLecture } from '@/lib/exercise-content/lettres-et-grilles';
import { getPooledContent } from '@/services/exercise-pool';

const GRID_SIZE = 5;
const TOTAL_ITEMS = GRID_SIZE * GRID_SIZE;

export function ReadingDirectionExercise() {
    const { student } = useContext(UserContext);
    const [grid, setGrid] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errorIndex, setErrorIndex] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    
    const loadGrid = useCallback(async () => {
        const [grille] = await getPooledContent<GrilleDeLecture>('reading-direction', 1, {
            settings: { taille: TOTAL_ITEMS },
            studentId: student?.id ?? null,
        });
        setGrid(grille?.cases ?? []);
    }, [student?.id]);

    useEffect(() => {
        loadGrid();
    }, [loadGrid]);

    const handleClick = (index: number) => {
        if (index === currentIndex) {
            setCurrentIndex(prev => prev + 1);
            setErrorIndex(null);
            if (index === TOTAL_ITEMS - 1) {
                setIsFinished(true);
            }
        } else {
            setErrorIndex(index);
            setTimeout(() => setErrorIndex(null), 500);
        }
    };

    const restartExercise = async () => {
        await loadGrid();
        setCurrentIndex(0);
        setErrorIndex(null);
        setIsFinished(false);
    };
    
    if (isFinished) {
        return (
            <Card className="relative mx-auto w-full max-w-lg rounded-[26px] p-8 text-center shadow-lg">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Confetti active={true} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 3000, stagger: 3}} />
                </div>
                <Star className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
                <h1 className="font-headline text-4xl mb-4">Bravo !</h1>
                <p className="text-lg text-muted-foreground mb-6">Tu as terminé l'exercice.</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button onClick={restartExercise} size="lg">
                        <RefreshCw className="mr-2" />
                        Recommencer
                    </Button>
                    {/* Aucun écran de fin ne doit être une impasse. */}
                    <Button asChild size="lg" variant="outline">
                        <Link href="/en-classe">Retour en classe</Link>
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-xl mx-auto shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Suis la flèche !</CardTitle>
                <p className="text-muted-foreground">Appuie sur les objets de gauche à droite, en partant de la première ligne.</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div 
                    className="grid gap-2"
                    style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    }}
                >
                    {grid.map((emoji, index) => (
                        <div key={index} className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                            {currentIndex <= index && (
                                <button
                                    onClick={() => handleClick(index)}
                                    className={cn(
                                        "text-4xl sm:text-5xl w-full h-full rounded-lg transition-all duration-200 flex items-center justify-center bg-secondary/50 hover:bg-secondary",
                                        currentIndex === index && "ring-4 ring-primary ring-offset-2",
                                        errorIndex === index && "animate-shake bg-red-200"
                                    )}
                                >
                                    {emoji}
                                </button>
                            )}
                            {currentIndex === index && (
                                 <ArrowRight className="absolute -left-8 h-8 w-8 text-primary animate-pulse hidden sm:block" />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
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
