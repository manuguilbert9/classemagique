
'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/context/user-context';
import { Home, Gem, Gamepad2, Shield, Disc3, Car, Camera, Zap, Sparkles } from 'lucide-react';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { PageBanner, PillLink, PillSlot } from '@/components/layout/page-banner';
import { PageShell, SectionLabel } from '@/components/layout/section';
import { NotConnected } from '@/components/layout/states';
import { RewardCard } from '@/components/rewards/reward-card';
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

  const handleNeonSkiGameEnd = async (score: number) => {
    // No rewards for Neon Ski
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
    return <NotConnected>Connecte-toi pour dépenser tes pépites.</NotConnected>;
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
        onGameEnd={handleNeonSkiGameEnd}
      />
    );
  }

  const nuggets = student.nuggets || 0;

  /** Le catalogue : ajouter un jeu, c'est ajouter une ligne ici. */
  const jeux = [
    { id: 'snake' as const, title: 'Snake', description: 'Un classique indémodable !', visual: <Gamepad2 />, cost: GAME_COST },
    { id: 'air_defense' as const, title: 'Défense aérienne', description: 'Détruis les envahisseurs !', visual: <Shield />, cost: GAME_COST },
    { id: 'boccia' as const, title: 'Boccia', description: 'Précision et stratégie !', visual: <Disc3 />, cost: GAME_COST },
    { id: 'gear_racer' as const, title: 'Rallye des rouages', description: 'Glisse et attrape les pièces dorées !', visual: <Car />, cost: GAME_COST },
    { id: 'ghost_hunt' as const, title: 'Chasse aux fantômes', description: "Attrape les fantômes, n'éclaire pas les dormeurs !", visual: <Zap />, cost: GHOST_HUNT_COST },
    { id: 'santa_sleigh' as const, title: 'Livraison de cadeaux', description: 'Aide le Père Noël à distribuer les cadeaux !', visual: '🎅', cost: GAME_COST },
    {
      id: 'neon_ski' as const,
      title: 'Ski on Neon',
      description: 'Glisse sur les ondes lumineuses !',
      visual: '⛷️',
      cost: GAME_COST,
      className: 'border-cyan-500/50',
      visualClassName: 'bg-slate-900',
      buttonClassName: 'bg-cyan-600 hover:bg-cyan-500',
    },
  ];

  return (
    <PageShell>
      <PageBanner
        icon={<Gem />}
        title="Salle des récompenses"
        subtitle="Tes pépites se dépensent ici."
        actions={
          <>
            <PillLink href="/en-classe" icon={Sparkles}>En classe</PillLink>
            <PillLink href="/" icon={Home}>Accueil</PillLink>
            <PillSlot>
              <FullscreenToggle />
            </PillSlot>
          </>
        }
      >
        {/* Le compteur de pépites, gros et lisible : c'est l'information que
            l'élève vient chercher en arrivant sur cette page. */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-400/25 px-4 py-2 text-xl font-extrabold">
          <Gem className="h-6 w-6" />
          {nuggets} pépite{nuggets > 1 ? 's' : ''}
        </div>
      </PageBanner>

      <section>
        <SectionLabel icon={<Camera />}>À débloquer une fois pour toutes</SectionLabel>
        <div className="flex flex-wrap justify-center gap-6">
          <RewardCard
            title="Ma photo de profil"
            description="Affiche ta photo en classe !"
            visual={
              student.showPhoto && student.photoURL ? (
                <img src={student.photoURL} alt={student.name} className="h-28 w-28 rounded-full border-4 border-primary object-cover" />
              ) : (
                <Camera />
              )
            }
            cost={PHOTO_UNLOCK_COST}
            nuggets={nuggets}
            actionLabel="Débloquer"
            onAction={handleUnlockPhoto}
            owned={student.showPhoto}
            ownedLabel="Ta photo est visible en classe"
          />
        </div>
      </section>

      <section>
        <SectionLabel icon={<Gamepad2 />}>Les jeux</SectionLabel>
        <div className="flex flex-wrap justify-center gap-6">
          {jeux.map((jeu) => (
            <RewardCard
              key={jeu.id}
              title={jeu.title}
              description={jeu.description}
              visual={jeu.visual}
              cost={jeu.cost}
              nuggets={nuggets}
              onAction={() => handlePlay(jeu.id)}
              className={jeu.className}
              visualClassName={jeu.visualClassName}
              buttonClassName={jeu.buttonClassName}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
