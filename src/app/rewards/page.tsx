
'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserContext } from '@/context/user-context';
import { Logo } from '@/components/logo';
import { Home, Gem, Gamepad2, ArrowLeft } from 'lucide-react';
import { SnakeGame } from '@/components/snake-game';
import { spendNuggets } from '@/services/students';
import { useToast } from '@/hooks/use-toast';

type GameState = 'selection' | 'playing' | 'gameover';

const GAME_COST = 2;

export default function RewardsPage() {
  const { student, refreshStudent } = useContext(UserContext);
  const [gameState, setGameState] = useState<GameState>('selection');
  const { toast } = useToast();

  const handlePlay = async () => {
    if (!student || (student.nuggets || 0) < GAME_COST) {
      toast({
        variant: 'destructive',
        title: 'Pépites insuffisantes',
        description: "Tu n'as pas assez de pépites pour jouer.",
      });
      return;
    }
    
    const result = await spendNuggets(student.id, GAME_COST);
    if (result.success) {
      refreshStudent(); // Refresh student data to show updated nugget count
      setGameState('playing');
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error || "Impossible de dépenser les pépites.",
      });
    }
  };

  const handleGameOver = () => {
    setGameState('selection'); // Return to selection screen after game over
  };
  
  if (!student) {
    return (
        <main className="container mx-auto px-4 py-8">
            <header className="mb-12 text-center space-y-4">
                <Logo />
                <h2 className="font-headline text-4xl sm:text-5xl">Veuillez vous connecter</h2>
                <Button asChild>
                    <Link href="/">Retour à l'accueil</Link>
                </Button>
            </header>
        </main>
    );
  }

  if (gameState === 'playing') {
    return (
        <SnakeGame 
            onGameOver={handleGameOver} 
            onReplay={handlePlay}
            canReplay={(student?.nuggets || 0) >= GAME_COST}
            gameCost={GAME_COST}
        />
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center space-y-4 relative">
        <div className="absolute top-0 left-0">
          <Button asChild variant="outline">
            <Link href="/en-classe">
              <ArrowLeft className="mr-2" /> Retour
            </Link>
          </Button>
        </div>
        <Logo />
        <h2 className="font-headline text-4xl sm:text-5xl">Salle des récompenses</h2>
        <div className="flex items-center justify-center gap-2 bg-amber-100 border border-amber-300 rounded-full px-4 py-2 text-amber-800 font-bold text-xl w-fit mx-auto">
            <Gem className="h-6 w-6" />
            <span>{student.nuggets || 0} pépites</span>
        </div>
      </header>

      <div className="flex justify-center">
        <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Snake</CardTitle>
            <CardDescription className="text-lg">Un classique indémodable !</CardDescription>
          </CardHeader>
          <CardContent>
            <Gamepad2 className="h-32 w-32 mx-auto text-primary" />
          </CardContent>
          <CardContent>
             <Button onClick={handlePlay} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < GAME_COST}>
              Jouer pour {GAME_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GAME_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
