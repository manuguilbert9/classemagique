
'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserContext } from '@/context/user-context';
import { Logo } from '@/components/logo';
import { Home, Gem, Gamepad2, ArrowLeft, Shield, Disc3, Car } from 'lucide-react';
import { SnakeGame } from '@/components/snake-game';
import { spendNuggets } from '@/services/students';
import { useToast } from '@/hooks/use-toast';
import { AirDefenseGame } from '@/components/air-defense-game';
import { BocciaGame } from '@/components/boccia-game';
import { GearRacerGame } from '@/components/gear-racer-game';

type GameState = 'selection' | 'playing_snake' | 'playing_air_defense' | 'playing_boccia' | 'playing_gear_racer';

const GAME_COST = 2;

export default function RewardsPage() {
  const { student, refreshStudent } = useContext(UserContext);
  const [gameState, setGameState] = useState<GameState>('selection');
  const { toast } = useToast();

  const handlePlay = async (game: 'snake' | 'air_defense' | 'boccia' | 'gear_racer') => {
    if (!student || (student.nuggets || 0) < GAME_COST) {
      toast({
        variant: 'destructive',
        title: 'Pépites insuffisantes',
        description: `Tu n'as pas assez de pépites pour jouer (coût: ${GAME_COST}).`,
      });
      return;
    }
    
    const result = await spendNuggets(student.id, GAME_COST);
    if (result.success) {
      refreshStudent();
      if (game === 'snake') {
        setGameState('playing_snake');
      } else if (game === 'air_defense') {
        setGameState('playing_air_defense');
      } else if (game === 'boccia') {
        setGameState('playing_boccia');
      } else if (game === 'gear_racer') {
        setGameState('playing_gear_racer');
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error || "Impossible de dépenser les pépites.",
      });
    }
  };

  const handleExitGame = () => {
    setGameState('selection'); 
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

  if (gameState === 'playing_snake') {
    return (
        <SnakeGame 
            onGameOver={handleExitGame} 
            onReplay={() => handlePlay('snake')}
            canReplay={(student?.nuggets || 0) >= GAME_COST}
            gameCost={GAME_COST}
        />
    );
  }

  if (gameState === 'playing_air_defense') {
    return (
        <AirDefenseGame
            onExit={handleExitGame}
            onReplay={() => handlePlay('air_defense')}
            canReplay={(student?.nuggets || 0) >= GAME_COST}
            gameCost={GAME_COST}
        />
    );
  }
  
  if (gameState === 'playing_boccia') {
    return (
        <BocciaGame
            onExit={handleExitGame}
        />
    );
  }

  if (gameState === 'playing_gear_racer') {
    return (
        <GearRacerGame
            onExit={handleExitGame}
            onReplay={() => handlePlay('gear_racer')}
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

      <div className="flex justify-center gap-8 flex-wrap">
        <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Snake</CardTitle>
            <CardDescription className="text-lg">Un classique indémodable !</CardDescription>
          </CardHeader>
          <CardContent>
            <Gamepad2 className="h-32 w-32 mx-auto text-primary" />
          </CardContent>
          <CardContent>
             <Button onClick={() => handlePlay('snake')} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < GAME_COST}>
              Jouer pour {GAME_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GAME_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>
        </Card>
         <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Défense Aérienne</CardTitle>
            <CardDescription className="text-lg">Détruisez les envahisseurs !</CardDescription>
          </CardHeader>
          <CardContent>
            <Shield className="h-32 w-32 mx-auto text-primary" />
          </CardContent>
          <CardContent>
             <Button onClick={() => handlePlay('air_defense')} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < GAME_COST}>
              Jouer pour {GAME_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GAME_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>
        </Card>
        <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Boccia</CardTitle>
            <CardDescription className="text-lg">Précision et stratégie !</CardDescription>
          </CardHeader>
          <CardContent>
            <Disc3 className="h-32 w-32 mx-auto text-primary" />
          </CardContent>
          <CardContent>
             <Button onClick={() => handlePlay('boccia')} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < GAME_COST}>
              Jouer pour {GAME_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GAME_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>
        </Card>
        <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Rallye des Rouages</CardTitle>
            <CardDescription className="text-lg">Glisse et attrape les pièces dorées !</CardDescription>
          </CardHeader>
          <CardContent>
            <Car className="h-32 w-32 mx-auto text-primary" />
          </CardContent>
          <CardContent>
             <Button onClick={() => handlePlay('gear_racer')} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < GAME_COST}>
              Jouer pour {GAME_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GAME_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
