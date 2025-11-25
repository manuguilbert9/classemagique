
'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserContext } from '@/context/user-context';
import { Logo } from '@/components/logo';
import { Home, Gem, Gamepad2, ArrowLeft, Shield, Disc3, Car, Camera, Zap } from 'lucide-react';
import { SnakeGame } from '@/components/snake-game';
import { spendNuggets, addNuggets, unlockProfilePhoto } from '@/services/students';
import { useToast } from '@/hooks/use-toast';
import { AirDefenseGame } from '@/components/air-defense-game';
import { BocciaGame } from '@/components/boccia-game';
import { GearRacerGame } from '@/components/gear-racer-game';
import { GhostHuntGame } from '@/components/ghost-hunt-game';
import { SantaSleighGame } from '@/components/santa-sleigh-game';
import { NeonSkiGame } from '@/components/neon-ski-game';

type GameState = 'selection' | 'playing_snake' | 'playing_air_defense' | 'playing_boccia' | 'playing_gear_racer' | 'playing_ghost_hunt' | 'playing_santa_sleigh' | 'playing_neon_ski';

const GAME_COST = 2;
const GHOST_HUNT_COST = 4;
const PHOTO_UNLOCK_COST = 30;

export default function RewardsPage() {
  const { student, refreshStudent } = useContext(UserContext);
  const [gameState, setGameState] = useState<GameState>('selection');
  const { toast } = useToast();

  const handlePlay = async (game: 'snake' | 'air_defense' | 'boccia' | 'gear_racer' | 'ghost_hunt' | 'santa_sleigh' | 'neon_ski') => {
    const cost = game === 'ghost_hunt' ? GHOST_HUNT_COST : GAME_COST;

    if (!student || (student.nuggets || 0) < cost) {
      toast({
        variant: 'destructive',
        title: 'Pépites insuffisantes',
        description: `Tu n'as pas assez de pépites pour jouer (coût: ${cost}).`,
      });
      return;
    }

    const result = await spendNuggets(student.id, cost);
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
      } else if (game === 'ghost_hunt') {
        setGameState('playing_ghost_hunt');
      } else if (game === 'santa_sleigh') {
        setGameState('playing_santa_sleigh');
      } else if (game === 'neon_ski') {
        setGameState('playing_neon_ski');
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

  const handleBossDefeated = async () => {
    if (!student) return;

    const result = await addNuggets(student.id, 10);
    if (result.success) {
      refreshStudent();
    }
  }


  const handleSantaGameEnd = async (score: number) => {
    if (!student) return;
    if (score > 0) {
      const result = await addNuggets(student.id, score);
      if (result.success) {
        refreshStudent();
        toast({
          title: 'Bravo !',
          description: `Tu as gagné ${score} pépites !`,
          className: 'bg-green-100 border-green-300 text-green-800',
        });
      }
    }
    setGameState('selection');
  };

  const handleUnlockPhoto = async () => {
    if (!student || (student.nuggets || 0) < PHOTO_UNLOCK_COST) {
      toast({
        variant: 'destructive',
        title: 'Pépites insuffisantes',
        description: `Tu n'as pas assez de pépites pour débloquer ta photo (coût: ${PHOTO_UNLOCK_COST}).`,
      });
      return;
    }

    if (student.showPhoto) {
      toast({
        title: 'Déjà débloqué',
        description: 'Ta photo de profil est déjà activée !',
      });
      return;
    }

    const result = await unlockProfilePhoto(student.id, PHOTO_UNLOCK_COST);
    if (result.success) {
      refreshStudent();
      toast({
        title: '🎉 Photo débloquée !',
        description: 'Ta photo de profil est maintenant visible !',
        className: 'bg-green-100 border-green-300 text-green-800',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error || "Impossible de débloquer la photo.",
      });
    }
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
        onBossDefeated={handleBossDefeated}
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

  if (gameState === 'playing_ghost_hunt') {
    return (
      <GhostHuntGame
        onExit={handleExitGame}
        onReplay={() => handlePlay('ghost_hunt')}
        canReplay={(student?.nuggets || 0) >= GHOST_HUNT_COST}
        gameCost={GHOST_HUNT_COST}
      />
    );

  }

  if (gameState === 'playing_santa_sleigh') {
    return (
      <SantaSleighGame
        onExit={handleExitGame}
        onReplay={() => handlePlay('santa_sleigh')}
        canReplay={(student?.nuggets || 0) >= GAME_COST}
        gameCost={GAME_COST}
        onGameEnd={handleSantaGameEnd}
      />
    );
  }

  if (gameState === 'playing_neon_ski') {
    return (
      <NeonSkiGame
        onExit={handleExitGame}
        onReplay={() => handlePlay('neon_ski')}
        canReplay={(student?.nuggets || 0) >= GAME_COST}
        gameCost={GAME_COST}
        onGameEnd={(score) => {
          // Optional: Add nuggets based on score
          handleExitGame();
        }}
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
            <CardTitle className="font-headline text-3xl">Ma Photo de Profil</CardTitle>
            <CardDescription className="text-lg">Affiche ta photo en classe !</CardDescription>
          </CardHeader>
          <CardContent>
            {student.showPhoto && student.photoURL ? (
              <img
                src={student.photoURL}
                alt={student.name}
                className="h-32 w-32 mx-auto rounded-full object-cover border-4 border-primary"
              />
            ) : (
              <Camera className="h-32 w-32 mx-auto text-primary" />
            )}
          </CardContent>
          <CardContent>
            {student.showPhoto ? (
              <div className="text-center">
                <p className="text-green-600 font-bold text-lg mb-2">✓ Déjà activée !</p>
                <p className="text-sm text-muted-foreground">Ta photo est visible en classe</p>
              </div>
            ) : (
              <>
                <Button onClick={handleUnlockPhoto} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < PHOTO_UNLOCK_COST}>
                  Débloquer pour {PHOTO_UNLOCK_COST} <Gem className="ml-2 h-5 w-5" />
                </Button>
                {(student.nuggets || 0) < PHOTO_UNLOCK_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
              </>
            )}
          </CardContent>
        </Card>
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
        <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Chasse aux Fantômes</CardTitle>
            <CardDescription className="text-lg">Attrape les fantômes ! N&apos;éclaire pas les dormeurs !</CardDescription>
          </CardHeader>
          <CardContent>
            <Zap className="h-32 w-32 mx-auto text-primary" />
          </CardContent>
          <CardContent>
            <Button onClick={() => handlePlay('ghost_hunt')} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < GHOST_HUNT_COST}>
              Jouer pour {GHOST_HUNT_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GHOST_HUNT_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>

        </Card>
        <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Livraison de Cadeaux</CardTitle>
            <CardDescription className="text-lg">Aide le Père Noël à distribuer les cadeaux !</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 w-32 mx-auto text-primary flex items-center justify-center text-6xl">
              🎅
            </div>
          </CardContent>
          <CardContent>
            <Button onClick={() => handlePlay('santa_sleigh')} size="lg" className="w-full text-lg" disabled={(student.nuggets || 0) < GAME_COST}>
              Jouer pour {GAME_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GAME_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>
        </Card>
        <Card className="w-full max-w-sm text-center transform transition-transform hover:scale-105 hover:shadow-xl border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-cyan-600">Ski on Neon</CardTitle>
            <CardDescription className="text-lg">Glisse sur les ondes lumineuses !</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 w-32 mx-auto text-primary flex items-center justify-center text-6xl bg-slate-900 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              ⛷️
            </div>
          </CardContent>
          <CardContent>
            <Button onClick={() => handlePlay('neon_ski')} size="lg" className="w-full text-lg bg-cyan-600 hover:bg-cyan-500" disabled={(student.nuggets || 0) < GAME_COST}>
              Jouer pour {GAME_COST} <Gem className="ml-2 h-5 w-5" />
            </Button>
            {(student.nuggets || 0) < GAME_COST && <p className="text-xs text-destructive mt-2">Tu n'as pas assez de pépites.</p>}
          </CardContent>
        </Card>
      </div>
    </main >
  );
}
